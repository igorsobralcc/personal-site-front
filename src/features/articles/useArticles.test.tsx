import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { articlesQueryKey, useArticle, useArticles } from './useArticles'
import { getArticle, getArticles, ArticleNotFoundError } from '../../shared/api/blog'
import { articleFixture, articleSummaryFixture } from '../../test/fixtures'

import type { ReactNode } from 'react'

vi.mock('../../shared/api/blog', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../shared/api/blog')>()
  return { ...original, getArticle: vi.fn(), getArticles: vi.fn() }
})
const mockGetArticle = vi.mocked(getArticle)
const mockGetArticles = vi.mocked(getArticles)

afterEach(() => vi.clearAllMocks())

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

it('AIX-010 AIX-011 configures list key, limit, cursor, and stale data', async () => {
  mockGetArticles
    .mockResolvedValueOnce({ items: [articleSummaryFixture], nextCursor: 'next' })
    .mockResolvedValueOnce({ items: [], nextCursor: null })
  const { wrapper } = setup()
  const hook = renderHook(() => useArticles(3), { wrapper })
  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true))
  expect(articlesQueryKey).toEqual(['articles'])
  expect(mockGetArticles).toHaveBeenCalledWith(null, 3, expect.any(AbortSignal))
  let nextResult: Awaited<ReturnType<typeof hook.result.current.fetchNextPage>> | undefined
  await act(async () => {
    nextResult = await hook.result.current.fetchNextPage()
  })
  expect(mockGetArticles).toHaveBeenLastCalledWith('next', 3, expect.any(AbortSignal))
  expect(nextResult?.hasNextPage).toBe(false)
})

it('ARD-009 disables an empty slug and identifies a nonempty slug', async () => {
  mockGetArticle.mockResolvedValue(articleFixture)
  const { wrapper } = setup()
  const empty = renderHook(() => useArticle(''), { wrapper })
  expect(empty.result.current.fetchStatus).toBe('idle')
  expect(mockGetArticle).not.toHaveBeenCalled()
  const active = renderHook(() => useArticle('dependable-products'), { wrapper })
  await waitFor(() => expect(active.result.current.isSuccess).toBe(true))
  expect(mockGetArticle).toHaveBeenCalledWith('dependable-products', expect.any(AbortSignal))
})

it('ARD-010 does not retry not-found', async () => {
  mockGetArticle.mockRejectedValue(new ArticleNotFoundError('missing'))
  const { wrapper } = setup()
  const hook = renderHook(() => useArticle('missing'), { wrapper })
  await waitFor(() => expect(hook.result.current.isError).toBe(true))
  expect(mockGetArticle).toHaveBeenCalledOnce()
})

it('ARD-010 retries a generic failure exactly once', async () => {
  mockGetArticle.mockRejectedValue(new Error('offline'))
  const { wrapper } = setup()
  const hook = renderHook(() => useArticle('broken'), { wrapper })
  await waitFor(() => expect(hook.result.current.isError).toBe(true))
  expect(mockGetArticle).toHaveBeenCalledTimes(2)
})
