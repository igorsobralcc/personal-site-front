import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useArticle } from '../features/articles/useArticles'
import { ArticleNotFoundError, type ArticleBlock } from '../shared/api/blog'

import type { ReactElement } from 'react'

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))

function assertNever(value: never): never {
  throw new Error(`Unhandled article block: ${JSON.stringify(value)}`)
}

function Block({ block }: { block: ArticleBlock }): ReactElement {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>
    case 'heading':
      return <h2>{block.text}</h2>
    case 'quote':
      return <blockquote>{block.text}</blockquote>
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul'
      return (
        <List>
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      )
    }
    case 'code':
      return (
        <pre aria-label={block.language ? `${block.language} code` : 'Code'}>
          <code>{block.code}</code>
        </pre>
      )
    case 'image':
      return (
        <figure>
          <img
            src={block.url}
            alt={block.alt}
            width={block.width}
            height={block.height}
            loading="lazy"
          />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )
    case 'table':
      return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Scrollable table regions must be keyboard focusable.
        <div className="table-scroll" role="region" aria-label={block.caption} tabIndex={0}>
          <table>
            <caption>{block.caption}</caption>
            <thead>
              <tr>
                {block.headers.map((cell, index) => (
                  <th scope="col" key={index}>
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'unsupported':
      return <p className="unsupported-block">This content type isn’t supported yet.</p>
    default:
      return assertNever(block)
  }
}

export function ArticlePage(): ReactElement {
  const { slug = '' } = useParams()
  const query = useArticle(slug)
  const article = query.data
  useEffect(() => {
    if (!article) return
    document.title = `${article.seoTitle ?? article.title} — Igor`
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = article.canonicalUrl ?? window.location.href
    return () => canonical?.remove()
  }, [article])
  if (query.isPending)
    return (
      <section className="state-panel" role="status">
        <p className="eyebrow">Article</p>
        <h1 tabIndex={-1}>Loading article…</h1>
        <div className="skeleton" />
      </section>
    )
  if (query.error instanceof ArticleNotFoundError)
    return (
      <section className="empty-page">
        <h1 tabIndex={-1}>Article not found</h1>
        <p>This article is unavailable or does not exist.</p>
        <div className="actions">
          <Link className="button button-primary" to="/articles">
            Browse Articles
          </Link>
          <Link className="button" to="/">
            Go Home
          </Link>
        </div>
      </section>
    )
  if (query.isError || !article)
    return (
      <section className="state-panel" role="alert">
        <h1 tabIndex={-1}>The article couldn’t be loaded.</h1>
        <p>The route is intact. You can retry without losing your place.</p>
        <button className="button button-primary" onClick={() => void query.refetch()}>
          Try again
        </button>
      </section>
    )
  return (
    <article className="reader">
      <Link className="back-link" to="/articles">
        ← Back to Articles
      </Link>
      <header>
        <div className="article-meta">
          {article.topic && <span className="topic">{article.topic}</span>}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          {article.readingTimeMinutes != null && <span>{article.readingTimeMinutes} min read</span>}
        </div>
        <h1 tabIndex={-1}>{article.title}</h1>
        <p className="article-deck">{article.summary}</p>
      </header>
      <div className="prose-article">
        {article.body.map((block, index) => (
          <Block block={block} key={index} />
        ))}
      </div>
    </article>
  )
}
