import type { ReactElement } from 'react'

export function PageLoader({ label }: { label: string }): ReactElement {
  return (
    <section className="state-panel" aria-live="polite">
      <span className="eyebrow">Please wait</span>
      <h1 tabIndex={-1}>{label}</h1>
      <div className="skeleton" />
      <div className="skeleton short" />
    </section>
  )
}
export function ErrorPanel({
  title,
  onRetry,
}: {
  title: string
  onRetry: () => void
}): ReactElement {
  return (
    <section className="state-panel" role="alert">
      <span className="eyebrow">Connection issue</span>
      <h1 tabIndex={-1}>{title}</h1>
      <p>The rest of the site is still available.</p>
      <button className="button button-primary" type="button" onClick={onRetry}>
        Try again
      </button>
    </section>
  )
}
