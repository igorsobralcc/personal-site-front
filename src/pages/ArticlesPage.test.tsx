import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ArticlesPage } from './ArticlesPage'
import { useArticles } from '../features/articles/useArticles'
import { articleSummary } from '../test/fixtures'

vi.mock('../features/articles/useArticles', () => ({ useArticles: vi.fn() }))
const mockUseArticles = vi.mocked(useArticles)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function state(value: Record<string, unknown>) {
  mockUseArticles.mockReturnValue(value as never)
  return render(
    <MemoryRouter>
      <ArticlesPage />
    </MemoryRouter>,
  )
}

const page = (items: ReturnType<typeof articleSummary>[], nextCursor: string | null = null) => ({
  pages: [{ items, nextCursor }],
  pageParams: [null],
})

describe('Deferred Articles index', () => {
  it('AIX-020 renders a stable pending state', () => {
    state({ isPending: true, isError: false, isSuccess: false })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ideas made useful')
    expect(screen.getByRole('status', { name: 'Loading articles' })).toBeInTheDocument()
  })

  it('AIX-021 renders initial error and invokes retry', () => {
    const refetch = vi.fn()
    state({ isPending: false, isError: true, isSuccess: false, refetch })
    expect(screen.getByRole('alert')).toHaveTextContent('Articles couldn’t be loaded')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('AIX-022 renders an empty archive', () => {
    state({ isPending: false, isError: false, isSuccess: true, data: page([]) })
    expect(screen.getByRole('heading', { name: 'No articles yet.' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Article archive' })).not.toBeInTheDocument()
  })

  it('AIX-023 features one article exactly once', () => {
    state({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: page([articleSummary({ title: 'Only article' })]),
      hasNextPage: false,
    })
    expect(screen.getByRole('heading', { name: 'Only article' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Article archive' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read Only article/ })).toHaveAttribute(
      'href',
      '/articles/dependable-products',
    )
  })

  it('AIX-024 AIX-025 features first and archives unique IDs in order', () => {
    const first = articleSummary({ id: '1', title: 'First', slug: 'first' })
    const second = articleSummary({
      id: '2',
      title: 'Second',
      slug: 'second',
      topic: null,
      readingTimeMinutes: null,
    })
    const duplicate = articleSummary({ id: '2', title: 'Duplicate' })
    state({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: page([first, second, duplicate]),
      hasNextPage: false,
    })
    const archive = screen.getByRole('region', { name: 'Article archive' })
    expect(within(archive).getAllByRole('listitem')).toHaveLength(1)
    expect(within(archive).getByRole('link', { name: 'Read: Second' })).toBeInTheDocument()
    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
  })

  it('AIX-040 loads a continuation and announces progress', () => {
    const fetchNextPage = vi.fn()
    state({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: page([articleSummary()], 'next'),
      hasNextPage: true,
      isFetchingNextPage: true,
      isFetchNextPageError: false,
      fetchNextPage,
    })
    const button = screen.getByRole('button', { name: 'Loading more articles…' })
    expect(button).toBeDisabled()
    expect(screen.getByText('Loading more articles', { selector: '.sr-only' })).toBeInTheDocument()
  })

  it('AIX-040 invokes continuation from the ready state', () => {
    const fetchNextPage = vi.fn()
    state({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: page([articleSummary()], 'next'),
      hasNextPage: true,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      fetchNextPage,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load more articles' }))
    expect(fetchNextPage).toHaveBeenCalledOnce()
  })

  it('AIX-042 AIX-043 preserves items and exposes continuation retry', () => {
    const fetchNextPage = vi.fn()
    state({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: page([articleSummary()], 'next'),
      hasNextPage: true,
      isFetchingNextPage: false,
      isFetchNextPageError: true,
      fetchNextPage,
    })
    expect(screen.getByText('Building dependable products')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Existing articles remain available')
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading more' }))
    expect(fetchNextPage).toHaveBeenCalledOnce()
  })
})
