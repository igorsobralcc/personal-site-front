import { Link } from 'react-router-dom'
import type { ArticleSummary } from '../api/blog'

const date = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))

export function ArticleRow({ article }: { article: ArticleSummary }) {
  return <Link className="article-row" to={`/articles/${article.slug}`} aria-label={`Read: ${article.title}`}>
    <time dateTime={article.publishedAt}>{date(article.publishedAt)}</time><div>{article.topic && <span className="row-topic">{article.topic}</span>}<h3>{article.title}</h3><p>{article.summary}</p></div>{article.readingTimeMinutes != null && <span className="reading-time">{article.readingTimeMinutes} min read</span>}<span className="round-arrow" aria-hidden="true">↗</span>
  </Link>
}
