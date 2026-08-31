import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { presentationQueryKey, usePresentation } from './usePresentation'
import { getPresentation } from '../../shared/api/presentation'
import { presentationFixture } from '../../test/fixtures'

import type { ReactNode } from 'react'

vi.mock('../../shared/api/presentation', () => ({ getPresentation: vi.fn() }))
const mockGetPresentation = vi.mocked(getPresentation)

afterEach(() => vi.clearAllMocks())

it('PRE-009 configures identity, signal, and cached freshness', async () => {
  mockGetPresentation.mockResolvedValue(presentationFixture)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const first = renderHook(() => usePresentation(), { wrapper })
  await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
  expect(presentationQueryKey).toEqual(['presentation'])
  expect(mockGetPresentation).toHaveBeenCalledOnce()
  expect(mockGetPresentation.mock.calls[0][0]).toBeInstanceOf(AbortSignal)
  const second = renderHook(() => usePresentation(), { wrapper })
  await waitFor(() => expect(second.result.current.isSuccess).toBe(true))
  expect(mockGetPresentation).toHaveBeenCalledOnce()
})

it('PRE-010 deduplicates simultaneous consumers', async () => {
  let resolve!: (value: typeof presentationFixture) => void
  mockGetPresentation.mockReturnValue(
    new Promise((value) => {
      resolve = value
    }),
  )
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const first = renderHook(() => usePresentation(), { wrapper })
  const second = renderHook(() => usePresentation(), { wrapper })
  expect(mockGetPresentation).toHaveBeenCalledOnce()
  resolve(presentationFixture)
  await waitFor(() =>
    expect(first.result.current.isSuccess && second.result.current.isSuccess).toBe(true),
  )
})
