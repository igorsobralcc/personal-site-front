import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const presentationFixture = {
  profile: {
    id: 'profile-1',
    fullName: 'Igor Sobral',
    headline: 'Build dependable products',
    shortSummary: 'A concise professional summary.',
    biography: 'A complete professional biography.',
    location: 'São Paulo, Brazil',
    email: 'igor@example.com',
    availability: 'Available for projects',
    currentFocus: 'Making complex systems easier to use.',
    socialLinks: [],
  },
  skillCategories: [
    { id: 'group-1', name: 'Frontend', skills: [{ id: 'skill-1', name: 'React' }] },
  ],
  projects: [
    {
      id: 'project-1',
      name: 'Portfolio Platform',
      summary: 'A public presentation platform.',
      liveUrl: null,
      repositoryUrl: null,
      technologies: [{ id: 'tech-1', name: 'TypeScript' }],
      image: null,
    },
  ],
  experiences: [
    {
      id: 'experience-1',
      company: 'Independent',
      role: 'Engineer',
      startDate: '2024-01-01',
      endDate: null,
      summary: 'Current work.',
    },
  ],
  updatedAt: '2026-08-31T00:00:00Z',
}

async function servePresentation(page: Page) {
  await page.route('**/api/presentation', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(presentationFixture),
    }),
  )
}

test.beforeEach(async ({ page }) => {
  await servePresentation(page)
})

test('BQA-001 BQA-010 completes the active discovery journey', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Build dependable products' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /igor@example.com/ })).toHaveAttribute(
    'href',
    'mailto:igor@example.com',
  )
  await page.getByRole('link', { name: /Meet the engineer/ }).click()
  await expect(page).toHaveURL(/\/presentation$/)
  await expect(page.getByText('Portfolio Platform')).toBeVisible()
  await expect(page).toHaveTitle('Presentation — Igor')
})

test('BQA-012 protects the deferred publishing feature gate', async ({ page }) => {
  const blogRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/articles')) blogRequests.push(request.url())
  })
  await page.goto('/articles/example')
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Articles' })).toHaveCount(0)
  expect(blogRequests).toEqual([])
})

test('BQA-003 BQA-050 recovers after automatic and manual request failures', async ({ page }) => {
  await page.unroute('**/api/presentation')
  let attempts = 0
  await page.route('**/api/presentation', (route) => {
    attempts += 1
    if (attempts <= 2)
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(presentationFixture),
    })
  })
  await page.goto('/presentation')
  await expect(page.getByRole('alert')).toContainText('presentation couldn’t be loaded', {
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('Portfolio Platform')).toBeVisible()
  expect(attempts).toBe(3)
})

test('BQA-020 BQA-023 supports compact keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')
  const menu = page.locator('.menu-button')
  await expect(menu).toHaveAccessibleName('Open menu')
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await expect(menu).toHaveAccessibleName('Close menu')
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
})

test('BQA-030 has no page-level horizontal overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/presentation')
  await expect(page.getByText('Portfolio Platform')).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
})

test('BQA-040 BQA-041 persists a manual theme across navigation and reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('link', { name: 'Presentation' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
})

test('BQA-042 removes nonessential motion for reduced-motion users', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const duration = await page
    .locator('.page-shell')
    .evaluate((element) => getComputedStyle(element).animationDuration)
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01)
})

test('BQA-025 has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/presentation')
  await expect(page.getByText('Portfolio Platform')).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(blocking).toEqual([])
})
