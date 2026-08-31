import { Link } from 'react-router-dom'

import { useArticles } from '../features/articles/useArticles'
import { ArticleRow } from '../shared/components/ArticleRow'

import type { ReactElement } from 'react'

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))
export function ArticlesPage(): ReactElement {
  const query = useArticles()
  const items =
    query.data?.pages
      .flatMap((page) => page.items)
      .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index) ?? []
  const [featured, ...archive] = items
  return (
    <>
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Articles</p>
          <h1 tabIndex={-1}>Ideas made useful.</h1>
          <p className="lede">
            Practical essays about product engineering, accessible interfaces, APIs, and the
            tradeoffs that shape good software.
          </p>
        </div>
      </header>
      {query.isPending && (
        <section className="container content-section" role="status" aria-label="Loading articles">
          <div className="skeleton" />
          <div className="skeleton short" />
        </section>
      )}
      {query.isError && (
        <section className="state-panel" role="alert">
          <h2>Articles couldn’t be loaded.</h2>
          <p>The archive is temporarily unavailable.</p>
          <button className="button button-primary" onClick={() => void query.refetch()}>
            Try again
          </button>
        </section>
      )}
      {query.isSuccess && !featured && (
        <section className="empty-page">
          <h2>No articles yet.</h2>
          <p>Writing is coming soon. Please check back later.</p>
        </section>
      )}
      {featured && (
        <>
          <section className="container content-section">
            <article className="featured-article">
              <div className="featured-visual" aria-hidden="true">
                <code>clear contracts</code>
                <code>accessible interfaces</code>
                <code>dependable systems</code>
              </div>
              <div className="featured-copy">
                <div className="article-meta">
                  {featured.topic && <span className="topic">{featured.topic}</span>}
                  <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                  {featured.readingTimeMinutes != null && (
                    <span>{featured.readingTimeMinutes} min read</span>
                  )}
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <Link className="button button-primary" to={`/articles/${featured.slug}`}>
                  Read {featured.title} ↗
                </Link>
              </div>
            </article>
          </section>
          {archive.length > 0 && (
            <section className="surface-section" aria-label="Article archive">
              <div className="container content-section">
                <div className="article-list" role="list">
                  {archive.map((article) => (
                    <div role="listitem" key={article.id}>
                      <ArticleRow article={article} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
          {query.hasNextPage && (
            <div className="container continuation">
              <button
                className="button"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage
                  ? 'Loading more articles…'
                  : query.isFetchNextPageError
                    ? 'Retry loading more'
                    : 'Load more articles'}
              </button>
              <span className="sr-only" aria-live="polite">
                {query.isFetchingNextPage ? 'Loading more articles' : ''}
              </span>
            </div>
          )}
          {query.isFetchNextPageError && (
            <p className="container continuation-error" role="alert">
              More articles couldn’t be loaded. Existing articles remain available.
            </p>
          )}
        </>
      )}
    </>
  )
}
