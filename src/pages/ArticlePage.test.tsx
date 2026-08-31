import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ArticlePage } from './ArticlePage'
import { useArticle } from '../features/articles/useArticles'
import { ArticleNotFoundError } from '../shared/api/blog'
import { article } from '../test/fixtures'

vi.mock('../features/articles/useArticles', () => ({ useArticle: vi.fn() }))
const mockUseArticle = vi.mocked(useArticle)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  document.querySelectorAll('link[rel="canonical"]').forEach((node) => node.remove())
  document.title = ''
})

function state(value: Record<string, unknown>, route = '/articles/dependable-products') {
  mockUseArticle.mockReturnValue(value as never)
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="articles/:slug" element={<ArticlePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Deferred Article reader', () => {
  it('ARD-020 passes route slug and renders loading', () => {
    state({ isPending: true })
    expect(mockUseArticle).toHaveBeenCalledWith('dependable-products')
    expect(screen.getByRole('status')).toHaveTextContent('Loading article')
  })

  it('ARD-021 renders privacy-neutral not-found actions', () => {
    state({ isPending: false, error: new ArticleNotFoundError('Article not found') })
    expect(screen.getByRole('heading', { name: 'Article not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse Articles' })).toHaveAttribute(
      'href',
      '/articles',
    )
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/')
  })

  it('ARD-022 ARD-023 renders generic error and invokes retry', () => {
    const refetch = vi.fn()
    state({
      isPending: false,
      isError: true,
      error: new Error('offline'),
      data: undefined,
      refetch,
    })
    expect(screen.getByRole('alert')).toHaveTextContent('retry without losing your place')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('ARD-024 ARD-030 through ARD-035 renders all normalized blocks and metadata', () => {
    state({ isPending: false, isError: false, data: article() })
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Building dependable products' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('7 min read')).toBeInTheDocument()
    expect(screen.getByText('Opening paragraph.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'A useful heading' })).toBeInTheDocument()
    expect(screen.getByText('A useful quotation.').tagName).toBe('BLOCKQUOTE')
    expect(screen.getAllByRole('list')).toHaveLength(2)
    expect(screen.getByLabelText('typescript code')).toHaveTextContent('const value = 1')
    const image = screen.getByRole('img', { name: 'Article diagram' })
    expect(image).toHaveAttribute('width', '800')
    expect(screen.getByText('Diagram caption')).toBeInTheDocument()
    const tableRegion = screen.getByRole('region', { name: 'Comparison' })
    expect(within(tableRegion).getByRole('columnheader', { name: 'Choice' })).toBeInTheDocument()
    expect(screen.getByText('This content type isn’t supported yet.')).toBeInTheDocument()
  })

  it('ARD-025 omits optional topic and reading time', () => {
    state({
      isPending: false,
      isError: false,
      data: article({ topic: null, readingTimeMinutes: null, body: [] }),
    })
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument()
  })

  it('ARD-032 labels code without a language', () => {
    state({
      isPending: false,
      isError: false,
      data: article({ body: [{ type: 'code', code: 'plain' }] }),
    })
    expect(screen.getByLabelText('Code')).toHaveTextContent('plain')
  })

  it('ARD-033 omits absent image caption', () => {
    state({
      isPending: false,
      isError: false,
      data: article({
        body: [
          {
            type: 'image',
            url: 'https://example.com/x.png',
            alt: 'No caption',
            width: 10,
            height: 20,
          },
        ],
      }),
    })
    expect(
      screen.getByRole('img', { name: 'No caption' }).parentElement?.querySelector('figcaption'),
    ).toBeNull()
  })

  it('ARD-040 ARD-041 sets SEO title and canonical then cleans them up', () => {
    const view = state({ isPending: false, isError: false, data: article() })
    expect(document.title).toBe('Dependable product engineering — Igor')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://example.com/articles/dependable-products',
    )
    view.unmount()
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('ARD-040 ARD-041 falls back to article title and current URL', () => {
    state({
      isPending: false,
      isError: false,
      data: article({ seoTitle: undefined, canonicalUrl: undefined, body: [] }),
    })
    expect(document.title).toBe('Building dependable products — Igor')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      window.location.href,
    )
  })
})
