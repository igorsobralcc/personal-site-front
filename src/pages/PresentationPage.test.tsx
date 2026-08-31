import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PresentationPage } from './PresentationPage'
import { usePresentation } from '../features/presentation/usePresentation'
import { presentation } from '../test/fixtures'

vi.mock('../features/presentation/usePresentation', () => ({ usePresentation: vi.fn() }))
const mockUsePresentation = vi.mocked(usePresentation)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function state(value: Record<string, unknown>) {
  mockUsePresentation.mockReturnValue(value as never)
  return render(<PresentationPage />)
}

describe('Presentation evaluation flow', () => {
  it('PRE-030 renders page loading semantics', () => {
    state({ isLoading: true, isError: false })
    expect(screen.getByText('Please wait')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loading presentation')
  })

  it('PRE-031 PRE-033 PRE-037 renders complete ordered business evidence', () => {
    state({ isLoading: false, isError: false, data: presentation() })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Engineering with the whole product in view',
    )
    expect(screen.getByText('A complete professional biography.')).toBeInTheDocument()
    const socials = screen.getByRole('list', { name: 'Social profiles' })
    expect(
      within(socials)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['GitHub profile ↗', 'LinkedIn profile ↗'])
    expect(screen.getAllByText('React')).toHaveLength(2)
    expect(screen.getByText('Portfolio Platform')).toBeInTheDocument()
    expect(screen.getByText('Jan 2024').parentElement).toHaveTextContent('Jan 2024 — Present')
    expect(screen.getByText('Dec 2023')).toBeInTheDocument()
  })

  it('PRE-032 falls back from short summary to headline and omits focus', () => {
    state({
      isLoading: false,
      isError: false,
      data: presentation({
        profile: { ...presentation().profile, shortSummary: null, currentFocus: null },
      }),
    })
    expect(screen.getByText('Build dependable products', { selector: '.lede' })).toBeInTheDocument()
    expect(screen.queryByText('Making complex systems easier to use.')).not.toBeInTheDocument()
  })

  it('PRE-035 PRE-036 renders secure project links and optional media', () => {
    state({ isLoading: false, isError: false, data: presentation() })
    const live = screen.getByRole('link', { name: 'Open Portfolio Platform live project' })
    const source = screen.getByRole('link', { name: 'Open Portfolio Platform source repository' })
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noreferrer')
    expect(source).toHaveAttribute('href', 'https://github.com/example/source')
    expect(screen.getByRole('img', { name: 'Portfolio project' })).toHaveAttribute(
      'loading',
      'lazy',
    )
    expect(screen.queryByRole('link', { name: /Systems Toolkit/ })).not.toBeInTheDocument()
  })

  it.each([
    ['skills', { skillCategories: [] }, 'Frontend'],
    ['projects', { projects: [] }, 'Portfolio Platform'],
    ['experiences', { experiences: [] }, 'Independent'],
  ])('PRE-039 omits an empty %s collection independently', (_name, override, absentText) => {
    state({ isLoading: false, isError: false, data: presentation(override) })
    expect(screen.queryByText(absentText)).not.toBeInTheDocument()
    expect(screen.getByText('A complete professional biography.')).toBeInTheDocument()
  })

  it('PRE-033 omits an empty social list', () => {
    state({
      isLoading: false,
      isError: false,
      data: presentation({ profile: { ...presentation().profile, socialLinks: [] } }),
    })
    expect(screen.queryByRole('list', { name: 'Social profiles' })).not.toBeInTheDocument()
  })

  it('PRE-040 PRE-041 renders retryable error for failure or missing data', () => {
    const refetch = vi.fn()
    state({ isLoading: false, isError: true, data: undefined, refetch })
    expect(screen.getByRole('alert')).toHaveTextContent('presentation couldn’t be loaded')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledOnce()
  })
})
