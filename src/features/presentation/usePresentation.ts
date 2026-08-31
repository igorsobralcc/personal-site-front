import { useQuery } from '@tanstack/react-query'

import { getPresentation } from '../../shared/api/presentation'

import type { Presentation } from '../../shared/api/presentation'
import type { UseQueryResult } from '@tanstack/react-query'

export const presentationQueryKey = ['presentation'] as const

export function usePresentation(): UseQueryResult<Presentation, Error> {
  return useQuery({
    queryKey: presentationQueryKey,
    queryFn: ({ signal }) => getPresentation(signal),
    staleTime: 60_000,
  })
}
