import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { getArticle, getArticles } from '../../shared/api/blog'

import type { Article, ArticlePage } from '../../shared/api/blog'
import type { InfiniteData, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query'

export const articlesQueryKey = ['articles'] as const

export function useArticles(
  limit = 8,
): UseInfiniteQueryResult<InfiniteData<ArticlePage, string | null>, Error> {
  return useInfiniteQuery({
    queryKey: [...articlesQueryKey, limit],
    queryFn: ({ pageParam, signal }) => getArticles(pageParam, limit, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 60_000,
  })
}

export function useArticle(slug: string): UseQueryResult<Article, Error> {
  return useQuery({
    queryKey: [...articlesQueryKey, slug],
    queryFn: ({ signal }) => getArticle(slug, signal),
    enabled: Boolean(slug),
    retry: (count, error) => error.name !== 'ArticleNotFoundError' && count < 1,
    staleTime: 60_000,
  })
}
