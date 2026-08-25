import { Link } from 'react-router-dom'
import { usePresentation } from '../features/presentation/usePresentation'
import { ArticleRow } from '../shared/components/ArticleRow'
import { ErrorPanel, PageLoader } from '../shared/components/States'
import { prototypeArticles } from '../shared/prototype/articles'

export function HomePage() {
  const query = usePresentation()
  if (query.isLoading) return <PageLoader label="Loading introduction" />
  if (query.isError || !query.data) return <ErrorPanel title="The introduction is taking a moment." onRetry={() => query.refetch()} />
  const { profile } = query.data
  const showPrototypeArticles = import.meta.env.DEV

  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy">
      {profile.availability && <p className="availability"><span className="availability-dot" aria-hidden="true" />{profile.availability}</p>}
      <h1 tabIndex={-1}>{profile.headline}</h1><p className="lede">{profile.shortSummary ?? profile.biography}</p>
      <div className="actions"><Link className="button button-primary" to="/presentation">Meet the engineer →</Link><Link className="button" to="/articles">Read the articles</Link></div>
    </div>{profile.currentFocus && <aside className="focus-panel" aria-label="Current focus"><p className="label">Current focus</p><p className="number" aria-hidden="true">01</p><p>{profile.currentFocus}</p></aside>}</div></section>
    <section className="surface-section"><div className="container content-section"><p className="eyebrow">Latest writing</p><h2 className="section-title">Notes from the work.</h2><p className="section-intro">Recent thinking about product engineering, accessible interfaces, and maintainable systems.</p>
      {showPrototypeArticles ? <><div className="article-list">{prototypeArticles.slice(0,2).map(article => <ArticleRow key={article.slug} article={article} />)}</div><Link className="text-link" to="/articles">View all articles →</Link></> : <div className="blog-pending"><p>Technical articles are coming soon. The public publishing contract is still being prepared.</p><Link className="text-link" to="/articles">Visit Articles →</Link></div>}
    </div></section>
  </>
}
