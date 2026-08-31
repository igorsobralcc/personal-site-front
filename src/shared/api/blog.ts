import { z } from 'zod'

import { parseContract } from './contract'
import { prototypeArticles } from '../prototype/articles'

const nonEmptyString = z.string().trim().min(1)
const httpUrl = z.url({ protocol: /^https?$/ })
const publishedAtSchema = z.union([z.iso.date(), z.iso.datetime({ offset: true })])

const paragraphBlockSchema = z.object({
  type: z.enum(['paragraph', 'heading', 'quote']),
  text: nonEmptyString,
})
const listBlockSchema = z.object({
  type: z.literal('list'),
  items: z.array(nonEmptyString),
  ordered: z.boolean().optional(),
})
const codeBlockSchema = z.object({
  type: z.literal('code'),
  code: z.string(),
  language: nonEmptyString.optional(),
})
const imageBlockSchema = z.object({
  type: z.literal('image'),
  url: httpUrl,
  alt: nonEmptyString,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: nonEmptyString.optional(),
})
const tableBlockSchema = z.object({
  type: z.literal('table'),
  caption: nonEmptyString,
  headers: z.array(nonEmptyString).min(1),
  rows: z.array(z.array(z.string())),
})

const knownBlockSchemas = {
  code: codeBlockSchema,
  heading: paragraphBlockSchema,
  image: imageBlockSchema,
  list: listBlockSchema,
  paragraph: paragraphBlockSchema,
  quote: paragraphBlockSchema,
  table: tableBlockSchema,
} as const

type KnownArticleBlock =
  | z.infer<typeof paragraphBlockSchema>
  | z.infer<typeof listBlockSchema>
  | z.infer<typeof codeBlockSchema>
  | z.infer<typeof imageBlockSchema>
  | z.infer<typeof tableBlockSchema>

export type UnsupportedArticleBlock = {
  type: 'unsupported'
  originalType: string
}

export const articleBlockSchema = z
  .unknown()
  .transform<KnownArticleBlock | UnsupportedArticleBlock>((value, context) => {
    if (typeof value !== 'object' || value === null || !('type' in value)) {
      context.addIssue({ code: 'custom', message: 'Article blocks require a type' })
      return z.NEVER
    }

    const type = value.type
    if (typeof type !== 'string' || type.length === 0) {
      context.addIssue({ code: 'custom', message: 'Article block type must be a string' })
      return z.NEVER
    }

    if (!(type in knownBlockSchemas)) return { type: 'unsupported', originalType: type }

    const schema = knownBlockSchemas[type as keyof typeof knownBlockSchemas]
    const result = schema.safeParse(value)
    if (result.success) return result.data

    for (const issue of result.error.issues) {
      context.addIssue({ code: 'custom', message: issue.message, path: issue.path })
    }
    return z.NEVER
  })

export const articleSummarySchema = z.object({
  id: nonEmptyString,
  slug: nonEmptyString,
  title: nonEmptyString,
  summary: nonEmptyString,
  publishedAt: publishedAtSchema,
  readingTimeMinutes: z.number().int().positive().nullish(),
  topic: nonEmptyString.nullish(),
  image: z
    .object({
      url: httpUrl,
      alt: nonEmptyString,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullish(),
})

export const articleSchema = articleSummarySchema.extend({
  updatedAt: publishedAtSchema.nullish(),
  tags: z.array(nonEmptyString).optional(),
  body: z.array(articleBlockSchema),
  canonicalUrl: httpUrl.optional(),
  seoTitle: nonEmptyString.optional(),
  seoDescription: nonEmptyString.optional(),
})

export const articlePageSchema = z.object({
  items: z.array(articleSummarySchema),
  nextCursor: z.string().min(1).nullable(),
})

export type ArticleBlock = z.infer<typeof articleBlockSchema>
export type ArticleSummary = z.infer<typeof articleSummarySchema>
export type Article = z.infer<typeof articleSchema>
export type ArticlePage = z.infer<typeof articlePageSchema>

export class ArticleNotFoundError extends Error {
  override readonly name = 'ArticleNotFoundError'
}

const endpoint = import.meta.env.VITE_BLOG_API_URL ?? '/api/v1/articles'
const useFixtures = import.meta.env.DEV && import.meta.env.VITE_USE_BLOG_FIXTURES !== 'false'

const summaries = prototypeArticles.map((article, index) =>
  parseContract(
    articleSummarySchema,
    {
      id: `prototype-${index + 1}`,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      publishedAt: article.isoDate,
      readingTimeMinutes: Number.parseInt(article.readingTime, 10),
      topic: article.topic,
    },
    'article summary fixture',
  ),
)

export async function getArticles(
  cursor?: string | null,
  limit = 8,
  signal?: AbortSignal,
): Promise<ArticlePage> {
  if (useFixtures) {
    const start = cursor ? Number(cursor) : 0
    return parseContract(
      articlePageSchema,
      {
        items: summaries.slice(start, start + limit),
        nextCursor: start + limit < summaries.length ? String(start + limit) : null,
      },
      'article page fixture',
    )
  }

  const url = new URL(endpoint, window.location.origin)
  url.searchParams.set('limit', String(limit))
  if (cursor) url.searchParams.set('cursor', cursor)
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Unable to load articles')
  const body: unknown = await response.json()
  return parseContract(articlePageSchema, body, 'article page')
}

export async function getArticle(slug: string, signal?: AbortSignal): Promise<Article> {
  if (useFixtures) {
    const source = prototypeArticles.find((item) => item.slug === slug)
    if (!source) throw new ArticleNotFoundError('Article not found')
    const summary = summaries.find((item) => item.slug === slug)
    if (!summary) throw new ArticleNotFoundError('Article not found')

    return parseContract(
      articleSchema,
      {
        ...summary,
        body:
          source.body?.map((block) =>
            block.type === 'note'
              ? { type: 'quote', text: block.text }
              : {
                  type: block.type === 'deck' ? 'paragraph' : block.type,
                  text: block.text,
                },
          ) ?? [],
      },
      'article fixture',
    )
  }

  const response = await fetch(`${endpoint}/${encodeURIComponent(slug)}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (response.status === 404) throw new ArticleNotFoundError('Article not found')
  if (!response.ok) throw new Error('Unable to load the article')
  const body: unknown = await response.json()
  return parseContract(articleSchema, body, 'article')
}
