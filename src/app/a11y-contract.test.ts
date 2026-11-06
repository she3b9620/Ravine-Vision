import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// vitest runs from the project root; resolve avoids relying on import.meta.url,
// which is not a file: URL inside the jsdom environment.
const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')

/**
 * Accessibility contract taken from the charter (§48 motion, §49 contrast and
 * focus). These are guards, not pixel tests: they fail loudly if the global
 * rules are dropped again.
 */
describe('stylesheets accessibility contract', () => {
  it('covers reduced motion globally, not per-shell', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\*,\*::before,\*::after/)
  })

  it('provides a visible keyboard focus ring', () => {
    expect(css).toContain(':focus-visible')
    expect(css).toMatch(/:focus-visible[^{]*\{[^}]*outline\s*:\s*2px solid/)
  })

  it('themes the focus ring so it stays visible on both surfaces', () => {
    expect(css).toMatch(/--rv-focus:\s*#D49A78/i)
    expect(css).toMatch(/html\[data-theme="light"\]\s*\{\s*--rv-focus:\s*#70402F\s*\}/i)
  })

  it('uses the palette brown for accent text in the light theme (AA on cream)', () => {
    const lightAccent = css.match(/html\[data-theme="light"\][^{]*\.rv-kicker[^{]*\{/i)
    expect(lightAccent).not.toBeNull()
    const rule = css.slice(css.indexOf('html[data-theme="light"] :is('), css.indexOf('#70402F', css.indexOf('html[data-theme="light"] :is(')) + 7)
    expect(rule).toContain('#70402F')
  })
})
