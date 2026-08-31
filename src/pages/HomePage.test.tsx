import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from './HomePage'
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
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('Home business flow', () => {
  it('PRE-020 keeps the business CTA available while pending', () => {
    state({ isPending: true, isError: false, data: undefined })
    expect(screen.getByRole('status')).toHaveTextContent('Loading introduction')
    expect(screen.getByRole('link', { name: /meet the engineer/i })).toHaveAttribute(
      'href',
      '/presentation',
    )
  })

  it('PRE-021 renders the complete concise profile without portfolio duplication', () => {
    state({ isPending: false, isError: false, data: presentation() })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Build dependable products' }),
    ).toBeInTheDocument()
    expect(screen.getByText('A concise professional summary.')).toBeInTheDocument()
    expect(screen.getByText('Available for projects')).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Current focus' })).toBeInTheDocument()
    expect(screen.queryByText('Selected work')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /articles/i })).not.toBeInTheDocument()
  })

  it('PRE-022 falls back to biography', () => {
    state({
      isPending: false,
      isError: false,
      data: presentation({ profile: { ...presentation().profile, shortSummary: null } }),
    })
    expect(screen.getByText('A complete professional biography.')).toBeInTheDocument()
  })

  it('PRE-023 PRE-024 omits optional availability and focus containers', () => {
    state({
      isPending: false,
      isError: false,
      data: presentation({
        profile: { ...presentation().profile, availability: null, currentFocus: null },
      }),
    })
    expect(screen.queryByText('Available for projects')).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: 'Current focus' })).not.toBeInTheDocument()
  })

  it('PRE-025 exposes retry while preserving the CTA', () => {
    const refetch = vi.fn()
    state({ isPending: false, isError: true, data: undefined, refetch })
    expect(screen.getByRole('alert')).toHaveTextContent('introduction couldn’t be loaded')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledOnce()
    expect(screen.getByRole('link', { name: /meet the engineer/i })).toBeInTheDocument()
  })
})
