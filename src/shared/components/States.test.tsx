import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { ErrorPanel, PageLoader } from './States'

it('SRT-040 renders loading semantics', () => {
  render(<PageLoader label="Loading evidence" />)
  expect(screen.getByText('Please wait').parentElement).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loading evidence')
})

it('SRT-041 renders an alert and invokes retry', () => {
  const retry = vi.fn()
  render(<ErrorPanel title="Unable to load" onRetry={retry} />)
  expect(screen.getByRole('alert')).toHaveTextContent('The rest of the site is still available')
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(retry).toHaveBeenCalledOnce()
})
