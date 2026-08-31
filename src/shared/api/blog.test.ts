import { afterEach, describe, expect, it, vi } from 'vitest'

import { articleFixture, articleSummaryFixture } from '../../test/fixtures'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function networkModule() {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_BLOG_FIXTURES', 'false')
  vi.resetModules()
  return import('./blog')
}

describe('Blog API fixtures', () => {
  it('AIX-001 AIX-002 paginates development summaries without fetch', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_USE_BLOG_FIXTURES', 'true')
    vi.resetModules()
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const { getArticles } = await import('./blog')
    const first = await getArticles(null, 2)
    const second = await getArticles(first.nextCursor, 2)
    expect(first.items).toHaveLength(2)
    expect(first.nextCursor).toBe('2')
    expect(second.items).toHaveLength(2)
    expect(second.nextCursor).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ARD-001 resolves and converts a known fixture article', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_USE_BLOG_FIXTURES', 'true')
    vi.resetModules()
    const { getArticle } = await import('./blog')
    const result = await getArticle('designing-api-contracts')
    expect(result.body.some((block) => block.type === 'quote')).toBe(true)
    expect(result.body.some((block) => block.type === 'paragraph')).toBe(true)
  })

  it('ARD-002 rejects an unknown fixture slug without fetch', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_USE_BLOG_FIXTURES', 'true')
    vi.resetModules()
    const { getArticle, ArticleNotFoundError } = await import('./blog')
    await expect(getArticle('missing')).rejects.toBeInstanceOf(ArticleNotFoundError)
  })
})

describe('Blog network API', () => {
  it('AIX-004 AIX-005 constructs and normalizes a valid feed request', async () => {
    const { getArticles } = await networkModule()
    const signal = new AbortController().signal
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ items: [articleSummaryFixture], nextCursor: 'next' }),
    } as Response)
    await expect(getArticles('cursor value', 3, signal)).resolves.toMatchObject({
      nextCursor: 'next',
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/api/v1/articles?limit=3&cursor=cursor+value')
    expect(init).toEqual({ signal, headers: { Accept: 'application/json' } })
  })

  it('AIX-004 omits a null cursor', async () => {
    const { getArticles } = await networkModule()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], nextCursor: null }),
    } as Response)
    await getArticles(null, 8)
    expect(String(fetchMock.mock.calls[0][0])).toBe('http://localhost:3000/api/v1/articles?limit=8')
  })

  it('AIX-006 rejects non-success feed responses', async () => {
    const { getArticles } = await networkModule()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response)
    await expect(getArticles()).rejects.toThrow('Unable to load articles')
  })

  it.each([
    [{ nextCursor: null }, 'items'],
    [{ items: [{}], nextCursor: null }, 'items.0'],
    [{ items: [], nextCursor: 4 }, 'nextCursor'],
  ])('AIX-007 rejects malformed feed contract %#', async (body, issue) => {
    const { getArticles } = await networkModule()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => body,
    } as Response)
    await expect(getArticles()).rejects.toMatchObject({
      name: 'ApiContractError',
      issues: expect.arrayContaining([expect.stringContaining(issue)]),
    })
  })

  it('ARD-003 ARD-004 encodes slug and returns valid article', async () => {
    const { getArticle } = await networkModule()
    const signal = new AbortController().signal
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, json: async () => articleFixture } as Response)
    await expect(getArticle('a/b c', signal)).resolves.toMatchObject({ id: 'article-1' })
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/articles/a%2Fb%20c', {
      signal,
      headers: { Accept: 'application/json' },
    })
  })

  it('ARD-005 gives 404 its privacy-neutral error type and name', async () => {
    const { getArticle, ArticleNotFoundError } = await networkModule()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response)
    const result = getArticle('private')
    await expect(result).rejects.toBeInstanceOf(ArticleNotFoundError)
    await expect(result).rejects.toMatchObject({ name: 'ArticleNotFoundError' })
  })

  it('ARD-006 rejects other detail failures', async () => {
    const { getArticle } = await networkModule()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(getArticle('broken')).rejects.toThrow('Unable to load the article')
  })

  it('ARD-007 rejects malformed article bodies', async () => {
    const { getArticle } = await networkModule()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...articleFixture, body: null }),
    } as Response)
    await expect(getArticle('broken')).rejects.toMatchObject({
      name: 'ApiContractError',
      operation: 'article',
    })
  })
})
