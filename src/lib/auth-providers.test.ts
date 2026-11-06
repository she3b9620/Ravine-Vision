import { describe, it, expect, vi, afterEach } from 'vitest'
import { getAuthProviders } from '@/lib/auth-providers'

const originalFetch = globalThis.fetch
const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const savedKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function configureBackend() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key'
}

describe('getAuthProviders', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch
    if (savedUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl
    if (savedKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = savedKey
  })

  it('reports google as available only when the provider is enabled', async () => {
    configureBackend()
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ external: { google: true } }), { status: 200 })) as unknown as typeof fetch

    await expect(getAuthProviders()).resolves.toEqual({ google: true })
  })

  it('reports google as unavailable when the provider is disabled', async () => {
    configureBackend()
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ external: { google: false, email: true } }), { status: 200 })) as unknown as typeof fetch

    await expect(getAuthProviders()).resolves.toEqual({ google: false })
  })

  it('fails closed when the settings call errors', async () => {
    configureBackend()
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch

    await expect(getAuthProviders()).resolves.toEqual({ google: false })
  })

  it('fails closed without a backend and never calls the network', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    const spy = vi.fn()
    globalThis.fetch = spy as unknown as typeof fetch

    await expect(getAuthProviders()).resolves.toEqual({ google: false })
    expect(spy).not.toHaveBeenCalled()
  })
})
