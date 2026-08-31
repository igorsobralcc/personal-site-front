import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider, useTheme } from './ThemeContext'

function Consumer() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>theme:{theme}</button>
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

describe('ThemeProvider', () => {
  it.each(['light', 'dark'] as const)('SRT-030 honors stored %s preference', (theme) => {
    window.localStorage.setItem('theme', theme)
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent(`theme:${theme}`)
    expect(document.documentElement).toHaveAttribute('data-theme', theme)
  })

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ] as const)('SRT-031 uses system preference %s', (matches, expected) => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
      writable: true,
    })
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent(`theme:${expected}`)
    expect(window.localStorage.getItem('theme')).toBe(expected)
  })

  it('SRT-031 ignores unsupported stored values', () => {
    window.localStorage.setItem('theme', 'sepia')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('theme:light')
  })

  it('SRT-032 toggles and persists both directions', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    const control = screen.getByRole('button')
    fireEvent.click(control)
    expect(control).toHaveTextContent('theme:dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
    fireEvent.click(control)
    expect(control).toHaveTextContent('theme:light')
  })

  it('uses the safe context default outside a provider', () => {
    render(<Consumer />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('theme:light')
  })
})
