import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'internal.local' }),
}))

import { originFromHeaders, getSiteOrigin } from '@/lib/site-origin'

function h(values: Record<string, string>): Headers {
  const headers = new Headers()
  for (const [k, v] of Object.entries(values)) headers.set(k, v)
  return headers
}

describe('originFromHeaders', () => {
  it('prefers the forwarded host and proto', () => {
    expect(
      originFromHeaders(
        h({ 'x-forwarded-host': 'ravine-vision.vercel.app', 'x-forwarded-proto': 'https' }),
      ),
    ).toBe('https://ravine-vision.vercel.app')
  })

  it('falls back to the host header and defaults to https', () => {
    expect(originFromHeaders(h({ host: 'ravine-vision.vercel.app' }))).toBe(
      'https://ravine-vision.vercel.app',
    )
  })

  it('keeps an explicit http proto (local development)', () => {
    expect(originFromHeaders(h({ host: 'localhost:3000', 'x-forwarded-proto': 'http' }))).toBe(
      'http://localhost:3000',
    )
  })

  it('uses the first entry when proxies append extra hosts', () => {
    expect(
      originFromHeaders(h({ 'x-forwarded-host': 'ravine.app, inner.proxy', 'x-forwarded-proto': 'https' })),
    ).toBe('https://ravine.app')
  })

  it('rejects hosts that could cause an open redirect', () => {
    expect(originFromHeaders(h({ 'x-forwarded-host': 'evil.example/path' }))).toBeNull()
    expect(originFromHeaders(h({ 'x-forwarded-host': 'evil.example?x=1' }))).toBeNull()
    expect(originFromHeaders(h({ 'x-forwarded-host': 'user@evil.example' }))).toBeNull()
    expect(originFromHeaders(h({ 'x-forwarded-host': 'evil.example:notaport' }))).toBeNull()
  })

  it('returns null when no host is present', () => {
    expect(originFromHeaders(h({}))).toBeNull()
  })
})

describe('getSiteOrigin', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = original
  })

  it('derives the origin from the request when the variable is absent', async () => {
    // next/headers is mocked to report host internal.local.
    await expect(getSiteOrigin()).resolves.toBe('https://internal.local')
  })

  it('lets an explicit configuration win and trims trailing slashes', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://ravine.app/'
    await expect(getSiteOrigin()).resolves.toBe('https://ravine.app')
  })
})
