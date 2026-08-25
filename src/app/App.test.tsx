import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { ThemeProvider } from '../shared/components/ThemeContext'

function renderApp(route = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><ThemeProvider><MemoryRouter initialEntries={[route]}><App /></MemoryRouter></ThemeProvider></QueryClientProvider>)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.classList.remove('theme-switching')
})

describe('site shell', () => {
  it('renders the public destinations and hides the deferred blog', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    renderApp('/presentation')
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Presentation' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Articles' })).not.toBeInTheDocument()
  })

  it('opens and closes the labeled navigation disclosure', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    renderApp('/presentation')
    const menu = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveFocus()
  })

  it('keeps the shared shell around unknown routes', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    renderApp('/missing')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found.' })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('treats deferred article routes as unavailable', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    renderApp('/articles')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found.' })).toBeInTheDocument()
    expect(screen.queryByText(/read articles/i)).not.toBeInTheDocument()
  })

  it('lets visitors switch and persist the color theme', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    renderApp('/')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })
})
