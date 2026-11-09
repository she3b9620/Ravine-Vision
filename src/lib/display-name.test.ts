import { describe, it, expect } from 'vitest'
import { resolveDisplayName } from '@/lib/display-name'

describe('resolveDisplayName', () => {
  it('prefers an explicit display name', () => {
    expect(resolveDisplayName({ display_name: 'Muhammad Shaaban', full_name: 'Other Name' })).toBe('Muhammad Shaaban')
  })

  it('uses the Google full_name when display_name is absent', () => {
    expect(resolveDisplayName({ full_name: 'Muhammad Shaaban', name: 'Muhammad Shaaban' })).toBe('Muhammad Shaaban')
  })

  it('falls back to the provider name', () => {
    expect(resolveDisplayName({ name: 'Muhammad Shaaban' })).toBe('Muhammad Shaaban')
  })

  it('trims and collapses whitespace', () => {
    expect(resolveDisplayName({ full_name: '  Muhammad   Shaaban  ' })).toBe('Muhammad Shaaban')
  })

  it('ignores empty and non-string values', () => {
    expect(resolveDisplayName({ display_name: '   ', full_name: 42, name: null })).toBe('')
    expect(resolveDisplayName(null)).toBe('')
    expect(resolveDisplayName(undefined)).toBe('')
  })

  it('caps very long names without trailing spaces', () => {
    const name = 'a'.repeat(100)
    expect(resolveDisplayName({ full_name: name })).toHaveLength(80)
  })
})
