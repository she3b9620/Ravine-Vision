import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Guards the database contract without needing a live database.
 *
 * The migrations are applied by a human, later and separately, so a mistake here
 * would surface only as a runtime failure in production. These checks run on
 * every `npm test`:
 *
 *  1. every table the code queries is created by a migration;
 *  2. every RPC the code calls is defined by a migration;
 *  3. every table has row level security enabled and at least one policy;
 *  4. every SECURITY DEFINER function pins search_path (privilege escalation).
 */

const ROOT = process.cwd()
const MIGRATIONS = resolve(ROOT, 'supabase/migrations')
const SRC = resolve(ROOT, 'src')

function stripComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const migrationSql = stripComments(
  readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'))
    .join('\n'),
)

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

const sourceFiles = walk(SRC).filter((f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))
const sourceText = sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n')

const createdTables = new Set(
  [...migrationSql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z0-9_]+)"?\s*\(/gi)].map(
    (m) => m[1].toLowerCase(),
  ),
)

const createdFunctions = new Set(
  [...migrationSql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z0-9_]+)"?/gi)].map(
    (m) => m[1].toLowerCase(),
  ),
)

const rlsTables = new Set(
  [
    ...migrationSql.matchAll(
      /alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?"?([a-z0-9_]+)"?\s+enable\s+row\s+level\s+security/gi,
    ),
  ].map((m) => m[1].toLowerCase()),
)

const policyCountByTable = new Map<string, number>()
for (const m of migrationSql.matchAll(
  /create\s+policy\s+(?:"[^"]+"|[a-z0-9_]+)\s+on\s+(?:public\.)?"?([a-z0-9_]+)"?/gi,
)) {
  const t = m[1].toLowerCase()
  policyCountByTable.set(t, (policyCountByTable.get(t) ?? 0) + 1)
}

describe('database contract', () => {
  it('creates every table the application queries', () => {
    const queried = new Set(
      [...sourceText.matchAll(/\.from\(\s*["']([a-zA-Z0-9_]+)["']\s*\)/g)].map((m) => m[1].toLowerCase()),
    )
    expect(queried.size).toBeGreaterThan(0)
    const missing = [...queried].filter((t) => !createdTables.has(t))
    expect(missing, `tables queried but never created: ${missing.join(', ')}`).toEqual([])
  })

  it('defines every RPC the application calls', () => {
    const called = new Set(
      [...sourceText.matchAll(/\.rpc\(\s*["']([a-zA-Z0-9_]+)["']/g)].map((m) => m[1].toLowerCase()),
    )
    expect(called.size).toBeGreaterThan(0)
    const missing = [...called].filter((f) => !createdFunctions.has(f))
    expect(missing, `RPCs called but never defined: ${missing.join(', ')}`).toEqual([])
  })

  it('enables row level security on every table', () => {
    const withoutRls = [...createdTables].filter((t) => !rlsTables.has(t))
    expect(withoutRls, `tables without RLS: ${withoutRls.join(', ')}`).toEqual([])
  })

  it('gives every table at least one policy (RLS with no policy returns nothing)', () => {
    const withoutPolicy = [...createdTables].filter((t) => (policyCountByTable.get(t) ?? 0) === 0)
    expect(withoutPolicy, `tables without policies: ${withoutPolicy.join(', ')}`).toEqual([])
  })

  it('pins search_path on every SECURITY DEFINER function', () => {
    const offenders: string[] = []
    for (const m of migrationSql.matchAll(
      /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z0-9_]+)"?\s*\([^)]*\)([\s\S]{0,700}?)(?=create\s+(?:or\s+replace\s+)?function|$)/gi,
    )) {
      const name = m[1].toLowerCase()
      const head = m[2]
      if (/security\s+definer/i.test(head) && !/set\s+search_path/i.test(head)) {
        offenders.push(name)
      }
    }
    expect(offenders, `SECURITY DEFINER without search_path: ${offenders.join(', ')}`).toEqual([])
  })
})
