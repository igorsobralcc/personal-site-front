import { Link } from 'react-router-dom'
import type { PrototypeArticle } from '../prototype/articles'

export function ArticleRow({ article }: { article: PrototypeArticle }) {
  return <Link className="article-row" to={`/articles/${article.slug}`} aria-label={`Read: ${article.title}`}>
    <time dateTime={article.isoDate}>{article.date}</time><div><h3>{article.title}</h3><p>{article.summary}</p></div><span className="reading-time">{article.readingTime}</span><span className="round-arrow" aria-hidden="true">↗</span>
  </Link>
}
