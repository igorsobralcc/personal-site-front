import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { usePresentation } from '../../features/presentation/usePresentation'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/presentation', label: 'Presentation', end: true },
  // { to: '/articles', label: 'Articles', end: false }, // Hidden until the Blog API is available.
]

export function SiteShell() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const { data } = usePresentation()

  useEffect(() => {
    setOpen(false)
    const title = location.pathname === '/' ? 'Igor — Software Engineer'
      : location.pathname === '/presentation' ? 'Presentation — Igor'
        // Blog titles are retained with their routes for the future publishing phase.
        // : location.pathname.startsWith('/articles/') ? 'Article — Igor'
        //   : location.pathname === '/articles' ? 'Articles — Igor'
        : 'Page not found — Igor'
    document.title = title
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus())
  }, [location.pathname])

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      document.documentElement.style.setProperty('--scroll-progress', String(Math.min(1, Math.max(0, progress))))
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      document.documentElement.style.removeProperty('--scroll-progress')
    }
  }, [location.pathname])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape' && open) { setOpen(false); menuButton.current?.focus() }
  }

  return <div className="site-canvas" onKeyDown={onKeyDown}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner">
      <Link className="brand" to="/" aria-label="Igor, Home"><span>I</span><strong>Igor&nbsp;/&nbsp;Engineer</strong></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(link => <NavLink className="nav-link" key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>)}</nav>
      <div className="header-actions"><button ref={menuButton} className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(value => !value)}>
        <svg aria-hidden="true" viewBox="0 0 24 24">{open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}</svg><span>Menu</span>
      </button></div>
      {open && <nav id="mobile-nav" className="mobile-nav" aria-label="Primary navigation">{links.map(link => <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}>{link.label}</NavLink>)}</nav>}
    </div></header>
    <main id="main"><div key={location.pathname} className="page-shell"><Outlet /></div></main>
    <footer className="site-footer"><div className="container footer-inner"><div><h2>Have a good problem to solve?</h2>{data?.profile.email ? <a className="footer-contact" href={`mailto:${data.profile.email}`}>{data.profile.email} ↗</a> : <span className="footer-contact">Contact details coming soon</span>}</div><div className="footer-meta"><p>{data?.profile.location ?? 'Based in Brazil'} · Working worldwide</p>{location.pathname !== '/' && <Link to="/">← Back to Home</Link>}{/* Blog-aware back link retained for later: <Link to={location.pathname.startsWith('/articles/') ? '/articles' : '/'}>...</Link> */}</div></div></footer>
  </div>
}
