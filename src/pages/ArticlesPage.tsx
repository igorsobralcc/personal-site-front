import { Link } from 'react-router-dom'
import { ArticleRow } from '../shared/components/ArticleRow'
import { prototypeArticles } from '../shared/prototype/articles'

export function ArticlesPage() {
  if (!import.meta.env.DEV) return <section className="empty-page"><p className="eyebrow">Articles</p><h1 tabIndex={-1}>Ideas, in progress.</h1><p>The publishing system is the next build phase. This route is ready; the public article contract is not yet available.</p></section>
  const featured = prototypeArticles.find(article => article.featured) ?? prototypeArticles[0]
  const archive = prototypeArticles.filter(article => article !== featured)
  return <><header className="page-header"><div className="container"><p className="eyebrow">Articles</p><h1 tabIndex={-1}>Ideas made useful.</h1><p className="lede">Practical essays about product engineering, accessible interfaces, APIs, and the tradeoffs that shape good software.</p></div></header>
    <section className="container content-section"><div className="featured-article"><div className="featured-visual" aria-hidden="true"><code>GET /presentation</code><code>→ one stable contract</code><code>→ many thoughtful views</code></div><div className="featured-copy"><div className="article-meta"><span className="topic">{featured.topic}</span><span>·</span><time dateTime={featured.isoDate}>{featured.date}</time><span>·</span><span>{featured.readingTime}</span></div><h2>{featured.title}</h2><p>{featured.summary}</p><Link className="button button-primary" to={`/articles/${featured.slug}`}>Read featured essay ↗</Link></div></div></section>
    <section className="surface-section"><div className="container content-section"><div className="article-list">{archive.map(article => <ArticleRow key={article.slug} article={article} />)}</div></div></section></>
}
