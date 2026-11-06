import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('notFound() should not be called for a valid locale')
  },
}))

import WorksPage from '@/app/[locale]/works/page'
import CreatorsPage from '@/app/[locale]/creators/page'
import CommunitiesPage from '@/app/[locale]/communities/page'
import DiscoverPage from '@/app/[locale]/discover/page'

const arParams = { params: Promise.resolve({ locale: 'ar' }) }

function renderDiscover(locale: string, category?: string) {
  return DiscoverPage({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve(category ? { category } : {}),
  })
}

/**
 * These tests lock in an integrity rule from the charter: the public discovery
 * surfaces must not link to routes that do not exist, and must not present
 * illustrative sample data as real activity.
 */
describe('public discovery integrity', () => {
  it('works page renders example cards without linking to a missing detail route', async () => {
    const { container } = render(await WorksPage(arParams))

    expect(container.querySelectorAll('a[href*="/works/1"]').length).toBe(0)
    expect(container.querySelectorAll('a[href*="/works/2"]').length).toBe(0)

    // Honest labelling instead of a fabricated "published" state.
    expect(screen.getAllByText('مثال توضيحي').length).toBeGreaterThan(0)
    expect(container.textContent).not.toContain('published')
  })

  it('creators page does not link to missing profiles or fabricate work counts', async () => {
    const { container } = render(await CreatorsPage(arParams))

    expect(container.querySelectorAll('a[href*="/creators/"]').length).toBe(0)
    expect(container.querySelectorAll('.rv-creator-works').length).toBe(0)
    expect(screen.getAllByText('مثال توضيحي').length).toBeGreaterThan(0)
  })

  it('communities page does not link to missing communities or offer a dead join action', async () => {
    const { container } = render(await CommunitiesPage(arParams))

    expect(container.querySelectorAll('a[href*="/communities/"]').length).toBe(0)
    expect(container.querySelectorAll('.rv-community-members').length).toBe(0)
    expect(container.textContent).not.toContain('انضم')
    expect(screen.getAllByText('مثال توضيحي').length).toBeGreaterThan(0)
  })
})

describe('discover category deep link', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/ar/discover')
  })

  it('renders the world named in ?category= on first paint', async () => {
    render(await renderDiscover('ar', 'cinema'))

    expect(screen.getByRole('button', { name: 'السينما والصورة' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('falls back to "all" for an unknown category', async () => {
    render(await renderDiscover('ar', 'does-not-exist'))

    expect(screen.getByRole('button', { name: 'كل العوالم' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('writes the chosen category back to the URL', async () => {
    render(await renderDiscover('en'))

    fireEvent.click(screen.getByRole('button', { name: 'Sound & dialogue' }))

    await waitFor(() => {
      expect(window.location.search).toBe('?category=audio')
    })
    expect(screen.getByRole('button', { name: 'Sound & dialogue' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
