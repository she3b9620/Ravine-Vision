import { render, screen } from '@testing-library/react'
import { SectionPlaceholder } from '@/components/section-placeholder'
import { describe, it, expect } from 'vitest'

describe('SectionPlaceholder', () => {
  it('renders correctly in Arabic', () => {
    render(
      <SectionPlaceholder
        locale="ar"
        code="TEST"
        title="عنوان تجريبي"
        description="وصف تجريبي للصفحة"
      />
    )
    expect(screen.getByText('RAVINE / TEST')).toBeInTheDocument()
    expect(screen.getByText('عنوان تجريبي')).toBeInTheDocument()
    expect(screen.getByText('وصف تجريبي للصفحة')).toBeInTheDocument()
    expect(screen.getByText('← الرئيسية')).toBeInTheDocument()
  })

  it('renders correctly in English', () => {
    render(
      <SectionPlaceholder
        locale="en"
        code="TEST"
        title="Test Title"
        description="Test Description"
      />
    )
    expect(screen.getByText('RAVINE / TEST')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('← Home')).toBeInTheDocument()
  })
})
