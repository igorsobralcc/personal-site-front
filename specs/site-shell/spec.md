# Feature: Responsive site shell and routing

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-24

## Outcome

Visitors can move predictably between Home, Presentation, and Articles through
a consistent, mobile-first shell that preserves the approved visual direction
and remains usable with a keyboard, assistive technology, reduced motion, and
JavaScript-driven route transitions.

## In scope

- A shared header, brand control, primary navigation, main landmark, and footer.
- Top-level routes `/`, `/presentation`, and `/articles`.
- Nested article route `/articles/:slug` without adding a fourth primary
  navigation item.
- Active-route indication in the primary navigation.
- A compact mobile navigation disclosure when the navigation no longer fits.
- Shared design tokens for color, typography, spacing, radii, and motion.
- A contact email action and location summary in the shared footer.
- Route-level title and focus management.

## Out of scope

- Content authoring or administrative navigation.
- Authentication and personalized navigation.
- Theme selection controls; the site follows the user's system preference.
- Search, filtering, analytics, cookie banners, and marketing modals.
- Presentation or article data fetching, which belongs to page features.

## User experience

The first render shows the requested route inside a consistent shell. The
desktop header exposes all three top-level destinations. At narrower widths it
shows a labeled Menu control that expands the same destinations without hiding
the current page or trapping focus.

Navigation changes render the destination page and update the document title.
Client-side navigation restores focus to the destination page heading and
places the viewport at the start of main content. Browser Back and Forward
restore the corresponding route. Direct navigation and refresh render the same
content as client-side navigation.

The shell itself has no loading or empty state. If route content is loading,
empty, partial, or in error, the page feature renders that state inside the main
landmark while the header and footer remain usable. Unknown routes render a
plain not-found page with a link to Home.

## Responsive behavior

- Begin with a fully usable 320 px layout and enhance at content-driven
  breakpoints.
- Keep the brand and Menu control on one row at the narrowest supported width.
- Collapse the primary navigation only when its content no longer fits; do not
  use a device-name breakpoint as the requirement.
- Expanded mobile navigation stacks full-width destinations below the header
  row without overlaying page content.
- Use bounded fluid type and spacing tokens; prevent horizontal page overflow.
- Keep every primary navigation and contact control at least 44 by 44 CSS
  pixels.
- The footer stacks its contact and location content when a two-column layout
  would compress either item.

## Accessibility

- Use one `header`, one primary `nav` with an accessible name, one `main`, and
  one `footer` per rendered document.
- Expose the current top-level route with `aria-current="page"`.
- The mobile Menu control uses `aria-expanded` and `aria-controls`; its visible
  label remains present in both states.
- Opening the mobile navigation does not move focus. Selecting a destination
  closes it. Escape closes it and returns focus to the Menu control.
- Preserve native tab order, browser focus indicators, and semantic links for
  navigation.
- Route changes announce a unique document title and move focus to the new
  page's `h1` without causing a visible focus ring on pointer navigation.
- Text and interactive states meet WCAG 2.2 AA contrast requirements in light
  and dark system appearances.
- Decorative icons are hidden from assistive technology; icon actions also
  have visible text.

## Motion

Route content may use a short opacity and vertical-transform transition to
preserve context. Navigation disclosure may animate opacity and transform, but
not height-dependent layout. No transition may delay access to content or run
longer than 250 ms.

Under `prefers-reduced-motion: reduce`, route and disclosure transitions are
removed, scrolling is immediate, and all content appears in its final state.

## API contract

The shell has no API dependency. It accepts route content from page components
and must not call either public API directly.

The contact email and location are presentation content, not shell constants.
Their values are provided by the Presentation page data boundary or a shared
presentation query cache populated by the Home feature. The shell must never
issue a duplicate request solely for its footer.

## Performance and resilience

- Keep the shell in the initial application bundle and lazy-load route feature
  code where doing so improves total transfer size without delaying Home.
- Do not load icon fonts; use inline, accessible SVG icons.
- Reserve the header's dimensions to prevent route content from shifting.
- Keep navigation responsive during route data fetching.
- Target LCP below 2.5 seconds, INP below 200 ms, and CLS below 0.1 on supported
  mobile conditions.

## Analytics and telemetry

No product analytics or navigation tracking is required. Operational frontend
error reporting may be introduced only through a separate approved
specification.

## Acceptance scenarios

### Scenario: Navigate between the three top-level pages

- Given the visitor is on Home
- When they activate Presentation and then Articles
- Then each destination renders at its canonical route
- And the corresponding navigation link exposes `aria-current="page"`
- And browser Back returns through the visited pages

### Scenario: Use the compact navigation

- Given the navigation does not fit at a narrow viewport
- When the visitor activates the labeled Menu control
- Then the three destinations become available in document order
- And selecting a destination closes the menu and renders that page

### Scenario: Navigate with a keyboard

- Given the visitor uses only a keyboard
- When they tab through the header, main content, and footer
- Then focus follows visual order with a visible indicator
- And no element traps focus

### Scenario: Load an unknown route

- Given the visitor opens a route that the application does not recognize
- When routing resolves
- Then a not-found heading and a semantic link to Home are rendered
- And the shared header and footer remain available

### Scenario: Respect reduced motion

- Given the visitor prefers reduced motion
- When they navigate or open the mobile menu
- Then content changes without animated movement or smooth scrolling

## Test evidence

- Component: header active state, mobile disclosure, Escape behavior, and
  footer content rendering.
- Integration: router handles direct entry, client navigation, Back/Forward,
  `/articles/:slug`, and not-found routes.
- Accessibility: automated landmark, name, contrast, and keyboard checks.
- End-to-end: navigation journey at 320 px, a content-driven compact breakpoint,
  and desktop width in light, dark, and reduced-motion modes.
- Performance: production build budget and Lighthouse/Core Web Vitals check.

## Decisions and open questions

- Decision: the primary navigation contains exactly Home, Presentation, and
  Articles.
- Decision: article detail is nested under Articles and is not a fourth
  top-level page.
- Decision: the shell follows the system color preference; no theme toggle is
  part of this feature.
- Question: confirm the production contact email and public location text before
  this specification is approved.
