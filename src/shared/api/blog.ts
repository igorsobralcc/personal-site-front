import { prototypeArticles } from '../prototype/articles'

export type ArticleBlock =
  | { type: 'paragraph' | 'heading' | 'quote'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'code'; code: string; language?: string }
  | { type: 'image'; url: string; alt: string; width: number; height: number; caption?: string }
  | { type: 'table'; caption: string; headers: string[]; rows: string[][] }
  | { type: string; [key: string]: unknown }

export interface ArticleSummary {
  id: string
  slug: string
  title: string
  summary: string
  publishedAt: string
  readingTimeMinutes?: number | null
  topic?: string | null
  image?: { url: string; alt: string; width: number; height: number } | null
}

export interface Article extends ArticleSummary {
  updatedAt?: string | null
  tags?: string[]
  body: ArticleBlock[]
  canonicalUrl?: string
  seoTitle?: string
  seoDescription?: string
}

export interface ArticlePage { items: ArticleSummary[]; nextCursor: string | null }
export class ArticleNotFoundError extends Error {}

const endpoint = import.meta.env.VITE_BLOG_API_URL ?? '/api/v1/articles'
const useFixtures = import.meta.env.DEV && import.meta.env.VITE_USE_BLOG_FIXTURES !== 'false'

const summaries: ArticleSummary[] = prototypeArticles.map((article, index) => ({
  id: `prototype-${index + 1}`,
  slug: article.slug,
  title: article.title,
  summary: article.summary,
  publishedAt: article.isoDate,
  readingTimeMinutes: Number.parseInt(article.readingTime, 10),
  topic: article.topic,
}))

function assertSummary(value: unknown): ArticleSummary {
  if (!value || typeof value !== 'object') throw new Error('The article feed returned malformed content')
  const item = value as Partial<ArticleSummary>
  if (!item.id || !item.slug || !item.title || !item.summary || !item.publishedAt) throw new Error('The article feed returned malformed content')
  return item as ArticleSummary
}

export async function getArticles(cursor?: string | null, limit = 8, signal?: AbortSignal): Promise<ArticlePage> {
  if (useFixtures) {
    const start = cursor ? Number(cursor) : 0
    return { items: summaries.slice(start, start + limit), nextCursor: start + limit < summaries.length ? String(start + limit) : null }
  }
  const url = new URL(endpoint, window.location.origin)
  url.searchParams.set('limit', String(limit))
  if (cursor) url.searchParams.set('cursor', cursor)
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Unable to load articles')
  const result = await response.json() as Partial<ArticlePage>
  if (!Array.isArray(result.items)) throw new Error('The article feed returned malformed content')
  return { items: result.items.map(assertSummary), nextCursor: typeof result.nextCursor === 'string' ? result.nextCursor : null }
}

export async function getArticle(slug: string, signal?: AbortSignal): Promise<Article> {
  if (useFixtures) {
    const source = prototypeArticles.find(item => item.slug === slug)
    if (!source) throw new ArticleNotFoundError('Article not found')
    return {
      ...summaries.find(item => item.slug === slug)!,
      body: source.body?.map(block => block.type === 'note'
        ? { type: 'quote', text: block.text }
        : { type: block.type === 'deck' ? 'paragraph' : block.type, text: block.text }) ?? [],
    }
  }
  const response = await fetch(`${endpoint}/${encodeURIComponent(slug)}`, { signal, headers: { Accept: 'application/json' } })
  if (response.status === 404) throw new ArticleNotFoundError('Article not found')
  if (!response.ok) throw new Error('Unable to load the article')
  const result = await response.json() as Article
  assertSummary(result)
  if (!Array.isArray(result.body)) throw new Error('The article returned malformed content')
  return result
}
