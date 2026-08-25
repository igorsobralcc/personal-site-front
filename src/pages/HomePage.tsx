import { Link } from 'react-router-dom'
import { usePresentation } from '../features/presentation/usePresentation'

// Blog feature references are intentionally preserved for the publishing phase.
// import { useArticles } from '../features/articles/useArticles'
// import { ArticleRow } from '../shared/components/ArticleRow'

export function HomePage() {
  const presentation = usePresentation()
  // const articles = useArticles(2)
  // const latest = articles.data?.pages[0]?.items ?? []
  const profile = presentation.data?.profile

  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy">
      {presentation.isPending && <div className="hero-loading" role="status"><h1 tabIndex={-1}>Loading introduction</h1><div className="skeleton" /><div className="skeleton short" /></div>}
      {presentation.isError && <div className="inline-state" role="alert"><h1 tabIndex={-1}>The introduction couldn’t be loaded.</h1><p>The rest of the site remains available.</p><button className="button button-primary" onClick={() => presentation.refetch()}>Try again</button></div>}
      {profile && <>{profile.availability && <p className="availability"><span className="availability-dot" aria-hidden="true" />{profile.availability}</p>}<h1 tabIndex={-1}>{profile.headline}</h1><p className="lede">{profile.shortSummary ?? profile.biography}</p></>}
      <div className="actions"><Link className="button button-primary" to="/presentation">Meet the engineer →</Link>{/* Blog action retained for later: <Link className="button" to="/articles">Read the articles</Link> */}</div>
    </div>{profile?.currentFocus && <aside className="focus-panel" aria-label="Current focus"><p className="label">Current focus</p><p className="number" aria-hidden="true">01</p><p>{profile.currentFocus}</p></aside>}</div></section>

    {/* Latest-writing section intentionally hidden until the Blog API contract is approved.
    <section className="surface-section" aria-labelledby="latest-heading">
      Article loading, retry, empty, and latest-item UI remains implemented in the
      article feature and can be restored without recreating its references.
    </section> */}
  </>
}
