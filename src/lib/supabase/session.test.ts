import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const redirectMock = vi.fn((url: string) => {
  throw new Error('REDIRECT:' + url)
})

vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}))

const getUserMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: getUserMock } }),
}))

import { requireUser } from '@/lib/supabase/session'

const user = { id: 'u1', email: 'a@b.c' }

describe('requireUser', () => {
  const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const savedKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  beforeEach(() => {
    redirectMock.mockClear()
    getUserMock.mockReset()
  })

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl
    if (savedKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = savedKey
  })

  function configureBackend() {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key'
  }

  it('redirects with error=backend when the backend is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    await expect(requireUser('ar')).rejects.toThrow('REDIRECT:/ar/login?error=backend')
    expect(getUserMock).not.toHaveBeenCalled()
  })

  it('redirects with error=backend when the backend call fails', async () => {
    configureBackend()
    getUserMock.mockRejectedValue(new Error('network down'))

    await expect(requireUser('en')).rejects.toThrow('REDIRECT:/en/login?error=backend')
  })

  it('redirects to plain sign-in when there is no session', async () => {
    configureBackend()
    getUserMock.mockResolvedValue({ data: { user: null } })

    await expect(requireUser('ar')).rejects.toThrow('REDIRECT:/ar/login')
  })

  it('returns the client and user for a signed-in session', async () => {
    configureBackend()
    getUserMock.mockResolvedValue({ data: { user } })

    const result = await requireUser('en')
    expect(result.user).toEqual(user)
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
