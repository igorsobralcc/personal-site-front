import { useQuery } from '@tanstack/react-query'
import { getPresentation } from '../../shared/api/presentation'

export const presentationQueryKey = ['presentation'] as const

export function usePresentation() {
  return useQuery({
    queryKey: presentationQueryKey,
    queryFn: ({ signal }) => getPresentation(signal),
    staleTime: 60_000,
  })
}
