# Feature: Shell, routing, theme, and browser-state test suite

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Automated tests prove that visitors can navigate every active and unavailable
route, retain usable shared chrome during data failures, operate compact
navigation and theme controls, and receive correct title, focus, scroll, and
accessibility behavior.

## In scope

- `App`, `SiteShell`, `ThemeProvider`, shared state panels, and NotFound page.
- Active, unknown, and deferred route resolution.
- Desktop and mobile navigation behavior.
- Route titles, heading focus, top restoration, history, and scroll progress.
- Theme initialization, persistence, transition lifecycle, and failure gaps.
- Footer shell fallbacks; business contact content is specified separately.

## Out of scope

- Detailed Home and Presentation content.
- Blog page behavior below the public feature gate.
- Third-party page or mail-client behavior.
- Pixel-perfect visual snapshots.

## Acceptance scenarios

### Route graph and shell

#### SRT-001 — Render active routes in one shell (P0, Active)

- Given a fresh application at `/` and `/presentation`
- When each route resolves
- Then exactly one header, named primary navigation, main, and footer render
- And the expected page renders inside the shared main landmark

#### SRT-002 — Resolve arbitrary unknown routes (P0, Active)

- Given `/missing`, `/admin`, `/presentation/extra`, or an encoded unknown path
- When routing resolves
- Then the shared 404 heading and Home action render
- And normal shell controls remain usable

#### SRT-003 — Keep publishing routes disabled (P0, Active)

- Given `/articles`, `/articles/example`, `/articles/`, or a deeper article path
- When routing resolves
- Then each route renders the shared 404 rather than article UI
- And neither Blog API function nor Blog endpoint is called

#### SRT-004 — Expose exact active navigation (P0, Active)

- Given Home or Presentation is active
- When primary navigation renders
- Then it contains exactly Home and Presentation in order
- And only the exact active destination has `aria-current="page"`
- And Articles is absent

#### SRT-005 — Navigate through every Home entry point (P1, Active)

- Given a non-home route
- When the visitor separately activates the brand, primary Home link, page Home
  action, and footer Back to Home link where each exists
- Then each semantic link resolves `/`
- And the footer back link is absent once Home renders

#### SRT-006 — Preserve Back and Forward history (P1, Active)

- Given the visitor navigates Home → Presentation → Home through links
- When browser Back and Forward are used
- Then route content and active navigation follow history order
- And the shell is not remounted as a second document

### Mobile navigation

#### SRT-010 — Toggle the menu (P0, Active)

- Given compact navigation is rendered
- When Menu is activated once and then again
- Then `aria-expanded` changes false → true → false
- And the controlled navigation appears and disappears
- And the accessible label changes between Open menu and Close menu

#### SRT-011 — Preserve navigation parity (P1, Active)

- Given the mobile menu is open
- When its destinations are inspected
- Then they match desktop destination order, URLs, labels, and active state

#### SRT-012 — Close after destination selection (P0, Active)

- Given the menu is open
- When a different or current destination is selected
- Then the menu closes
- And the selected route remains or becomes active

#### SRT-013 — Close with Escape and restore focus (P0, Active)

- Given the menu is open and focus may be inside its links
- When Escape bubbles through the site canvas
- Then the menu closes and the Menu button receives focus

#### SRT-014 — Ignore Escape while closed (P2, Active)

- Given the menu is closed
- When Escape is pressed
- Then navigation state and focus are unchanged

#### SRT-015 — Close on unrelated route change (P1, Active)

- Given the menu is open
- When route state changes through history or another link
- Then the menu closes without requiring an additional visitor action

#### SRT-016 — Characterize outside click and resize (P2, Active)

- Given the menu is open
- When the visitor clicks outside it or expands the viewport
- Then the current implementation leaves open state unchanged
- And the test records behavior without inventing a close requirement

### Title, focus, and scroll

#### SRT-020 — Set the title for each route class (P0, Active)

- Given Home, Presentation, or an unknown/deferred path
- When the pathname effect runs
- Then the title is respectively `Igor — Software Engineer`,
  `Presentation — Igor`, or `Page not found — Igor`

#### SRT-021 — Ignore search and hash for title selection (P2, Active)

- Given an active pathname with query parameters or a fragment
- When navigation occurs
- Then the title remains the pathname's canonical title

#### SRT-022 — Restore top and focus the route heading (P0, Active)

- Given a client-side pathname change
- When the route effect completes its animation frame
- Then `scrollTo` is called with top 0 and instant behavior
- And the first main `h1` receives programmatic focus

#### SRT-023 — Safely handle no immediate heading (P1, Active)

- Given a route state has no `main h1` during the scheduled frame
- When focus restoration runs
- Then it is a no-op and does not throw
- And later data resolution does not unexpectedly steal focus

#### SRT-024 — Do not rerun pathname effects for query-only changes (P2, Active)

- Given the pathname stays constant
- When only search or hash changes
- Then title/focus/top restoration does not run again

#### SRT-025 — Calculate scroll progress (P1, Active)

- Given a scrollable page
- When initial render, scroll, and resize occur
- Then `--scroll-progress` represents `scrollY / scrollableHeight`
- And values below 0 or above 1 are clamped

#### SRT-026 — Handle a non-scrollable document and cleanup (P1, Active)

- Given document height is not greater than viewport height
- When progress initializes and the shell later unmounts or route effect resets
- Then progress is 0
- And listeners and the CSS property are removed exactly once

### Theme

#### SRT-030 — Honor a valid stored preference (P0, Active)

- Given local storage contains light or dark while system preference differs
- When ThemeProvider initializes
- Then the stored value wins, updates the root dataset, and controls toggle label

#### SRT-031 — Fall back to system preference (P0, Active)

- Given storage is missing or contains an unsupported value
- When system preference is dark or light
- Then initial theme matches the system and the normalized value is persisted

#### SRT-032 — Toggle and persist both directions (P0, Active)

- Given either active theme
- When the toggle is activated
- Then the opposite theme is applied and persisted
- And the accessible label describes the next available theme

#### SRT-033 — Manage switching animation lifecycle (P1, Active)

- Given fake timers and an active theme toggle
- When it is activated
- Then switching state and the root class are present before 650 ms
- And both clear at 650 ms

#### SRT-034 — Handle rapid repeated toggles (P1, Active)

- Given the prior switching timer has not completed
- When the toggle is activated again
- Then the prior timer is cleared, the theme toggles again, and one final timer
  controls cleanup

#### SRT-035 — Clear the timer on unmount (P1, Active)

- Given a pending theme timer
- When the shell unmounts
- Then the timer is cleared and no state update occurs afterward

#### SRT-036 — Characterize storage read failure (P1, Active gap)

- Given `localStorage.getItem` throws
- When ThemeProvider initializes
- Then a characterization test captures the current render failure
- And graceful fallback must not be asserted until resilience is implemented

#### SRT-037 — Characterize storage write failure (P1, Active gap)

- Given `localStorage.setItem` throws
- When initial persistence or toggle persistence runs
- Then a characterization test captures the current effect failure

#### SRT-038 — Characterize missing matchMedia (P2, Active gap)

- Given storage has no valid value and `matchMedia` is unavailable
- When ThemeProvider initializes
- Then the current failure is recorded for a later support decision

#### SRT-039 — Characterize ignored runtime preference changes (P2, Active)

- Given ThemeProvider initialized from the system
- When system preference changes without visitor toggling
- Then the theme remains unchanged because no listener is registered

### Shared states and accessibility

#### SRT-040 — Render PageLoader semantics (P1, Active)

- Given a supplied loading label
- When PageLoader renders
- Then a polite live region, one focusable page heading, and inert skeletons render

#### SRT-041 — Render and operate ErrorPanel (P1, Active)

- Given a supplied title and retry callback
- When ErrorPanel renders and Try again is activated by click and keyboard
- Then an alert with recovery context renders and the callback runs once per
  activation

#### SRT-042 — Operate the skip link (P1, Active)

- Given the shared shell
- When the visitor focuses and activates Skip to content
- Then its target is the unique `#main` landmark

#### SRT-043 — Hide decorative controls from accessibility APIs (P2, Active)

- Given shell icons and theme bulb graphics
- When the accessibility tree is inspected
- Then the button names come from explicit labels and decorative SVG content is
  hidden

## Test evidence

- Component: `ThemeContext`, `States`, `NotFoundPage`, navigation disclosures.
- Integration: `App` + MemoryRouter/HistoryRouter + real QueryClient.
- Controlled browser-global tests: title, focus, scroll, timers, storage, media.
- E2E cases are cross-referenced in `browser-quality.md`.

## Decisions and open questions

- Decision: deferred paths are tested as 404 at public-router level.
- Decision: outside-click and resize menu behavior is characterized, not changed
  by the test initiative.
- Decision: current storage/media failures receive gap tests until hardening is
  separately approved.
- Question: decide whether focus should move again when an asynchronously loaded
  content heading replaces the loading heading.
