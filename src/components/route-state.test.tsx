import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouteState } from '@/components/route-state'

describe('RouteState', () => {
  const props = {
    code: '404',
    titleAr: 'لا يوجد شيء هنا.',
    titleEn: 'Nothing here.',
    bodyAr: 'نص عربي.',
    bodyEn: 'English body.',
  }

  it('presents both languages with the document direction set to RTL', () => {
    const { container } = render(<RouteState {...props} />)

    expect(screen.getByRole('heading', { name: 'لا يوجد شيء هنا.' })).toBeInTheDocument()
    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
    expect(screen.getByText('English body.')).toBeInTheDocument()

    const main = container.querySelector('main')
    expect(main).toHaveAttribute('dir', 'rtl')
    expect(main?.className).toContain('rv-state-notice')
  })

  it('offers a way back into each locale', () => {
    render(<RouteState {...props} />)

    expect(screen.getByRole('link', { name: /العربية/ })).toHaveAttribute('href', '/ar')
    expect(screen.getByRole('link', { name: /English/ })).toHaveAttribute('href', '/en')
  })

  it('applies the error tone when used by the error boundary', () => {
    const { container } = render(<RouteState {...props} tone="error" />)
    expect(container.querySelector('main')?.className).toContain('rv-state-error')
  })
})
