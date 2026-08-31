import { Link } from 'react-router-dom'

import type { ReactElement } from 'react'

export function NotFoundPage(): ReactElement {
  return (
    <section className="empty-page">
      <p className="eyebrow">404</p>
      <h1 tabIndex={-1}>Page not found.</h1>
      <p>The route you followed doesn’t map to anything here. Navigation is intact above.</p>
      <div className="actions">
        <Link className="button button-primary" to="/">
          Go home
        </Link>
        {/* Blog action retained for later: <Link className="button" to="/articles">Read articles</Link> */}
      </div>
    </section>
  )
}
