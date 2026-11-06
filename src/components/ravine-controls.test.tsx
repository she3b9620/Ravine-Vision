import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/app/[locale]/auth/actions', () => ({
  signInWithGoogleAction: vi.fn(),
}))

import RAVINEControls from '@/components/ravine-controls'

function openModal() {
  fireEvent.click(screen.getByRole('button', { name: /إنشاء حساب/ }))
}

describe('RAVINEControls provider gating', () => {
  it('hides the Google button when the provider is not enabled', () => {
    render(<RAVINEControls locale="ar" googleEnabled={false} />)
    openModal()

    expect(screen.queryByRole('button', { name: /Google/ })).toBeNull()
    expect(screen.getByText(/غير مُفعّل في هذه البيئة/)).toBeInTheDocument()
    // email remains available so nobody is locked out
    expect(screen.getByRole('link', { name: /البريد الإلكتروني/ })).toBeInTheDocument()
  })

  it('shows the Google button when the provider is enabled', () => {
    render(<RAVINEControls locale="en" googleEnabled />)
    fireEvent.click(screen.getByRole('button', { name: /Create account/ }))

    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeInTheDocument()
    expect(screen.queryByText(/not enabled in this environment/)).toBeNull()
  })

  it('defaults to hiding the provider when the flag is omitted', () => {
    render(<RAVINEControls locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: /Create account/ }))

    expect(screen.queryByRole('button', { name: /Continue with Google/ })).toBeNull()
  })
})
