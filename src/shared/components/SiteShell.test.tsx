import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SiteShell } from './SiteShell'
import { ThemeProvider } from './ThemeContext'
import { usePresentation } from '../../features/presentation/usePresentation'
import { presentation } from '../../test/fixtures'

vi.mock('../../features/presentation/usePresentation', () => ({ usePresentation: vi.fn() }))
const mockUsePresentation = vi.mocked(usePresentation)

function Page({ name }: { name: string }) {
  return (
    <>
      <h1 tabIndex={-1}>{name}</h1>
      <p>Page content</p>
    </>
  )
}

function Jump() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/missing')}>Jump</button>
}

function renderShell(route = '/', data: unknown = presentation()) {
  mockUsePresentation.mockReturnValue({ data } as never)
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<SiteShell />}>
            <Route
              index
              element={
                <>
                  <Page name="Home page" />
                  <Jump />
                </>
              }
            />
            <Route path="presentation" element={<Page name="Presentation page" />} />
            <Route path="*" element={<Page name="Missing page" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.useRealTimers()
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.style.removeProperty('--scroll-progress')
})

describe('SiteShell', () => {
  it('SRT-001 SRT-004 renders landmarks and exact active navigation', () => {
    renderShell('/presentation')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Primary navigation' })[0]).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Presentation' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('link', { name: 'Articles' })).not.toBeInTheDocument()
  })

  it('SRT-010 toggles compact navigation with correct labels', () => {
    renderShell()
    const menu = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menu)
    expect(menu).toHaveAccessibleName('Close menu')
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('navigation', { name: 'Primary navigation' })).toHaveLength(2)
    fireEvent.click(menu)
    expect(menu).toHaveAccessibleName('Open menu')
  })

  it('SRT-012 closes the menu after destination selection', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const navs = screen.getAllByRole('navigation', { name: 'Primary navigation' })
    fireEvent.click(navs[1].querySelector('a[href="/presentation"]') as HTMLElement)
    expect(screen.getByRole('heading', { name: 'Presentation page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('SRT-013 closes on Escape and restores menu focus', () => {
    renderShell()
    const menu = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menu)
    fireEvent.keyDown(screen.getByText('Page content').closest('.site-canvas')!, { key: 'Escape' })
    expect(menu).toHaveFocus()
    expect(menu).toHaveAttribute('aria-expanded', 'false')
  })

  it('SRT-015 SRT-020 closes and updates title on unrelated navigation', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Jump' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(document.title).toBe('Page not found — Igor')
  })

  it.each([
    ['/', 'Igor — Software Engineer'],
    ['/presentation', 'Presentation — Igor'],
    ['/unknown', 'Page not found — Igor'],
  ])('SRT-020 sets title for %s', (route, title) => {
    renderShell(route)
    expect(document.title).toBe(title)
  })

  it('SRT-022 restores top and focuses the route heading', () => {
    renderShell('/presentation')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
    expect(screen.getByRole('heading', { name: 'Presentation page' })).toHaveFocus()
  })

  it('SRT-030 SRT-032 toggles theme and updates its accessible label', () => {
    renderShell()
    const toggle = screen.getByRole('button', { name: 'Switch to dark mode' })
    fireEvent.click(toggle)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(toggle).toHaveAccessibleName('Switch to light mode')
  })

  it('SRT-033 SRT-034 clears only the final rapid-toggle timer', () => {
    vi.useFakeTimers()
    renderShell()
    const toggle = screen.getByRole('button', { name: /Switch to/ })
    fireEvent.click(toggle)
    vi.advanceTimersByTime(300)
    fireEvent.click(toggle)
    expect(document.documentElement).toHaveClass('theme-switching')
    vi.advanceTimersByTime(649)
    expect(document.documentElement).toHaveClass('theme-switching')
    vi.advanceTimersByTime(1)
    expect(document.documentElement).not.toHaveClass('theme-switching')
  })

  it('PRE-050 PRE-052 renders contact and location from shared data', () => {
    renderShell()
    expect(screen.getByRole('link', { name: /igor@example.com/ })).toHaveAttribute(
      'href',
      'mailto:igor@example.com',
    )
    expect(screen.getByText(/São Paulo, Brazil · Working worldwide/)).toBeInTheDocument()
  })

  it('PRE-051 renders independent footer fallbacks', () => {
    renderShell('/', null)
    expect(screen.getByText('Contact details coming soon')).toBeInTheDocument()
    expect(screen.getByText(/Based in Brazil · Working worldwide/)).toBeInTheDocument()
  })

  it('SRT-025 SRT-026 initializes zero progress and cleans up', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const view = renderShell()
    expect(document.documentElement.style.getPropertyValue('--scroll-progress')).toBe('0')
    view.unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(document.documentElement.style.getPropertyValue('--scroll-progress')).toBe('')
  })
})
