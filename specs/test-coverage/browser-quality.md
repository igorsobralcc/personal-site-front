# Feature: Browser, accessibility, responsive, and production-quality test suite

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Real-browser and build-level checks prove the active business funnel and
cross-cutting behavior that unit/component coverage cannot establish: actual
history, focus, layout, contrast, target sizing, reduced motion, production
feature isolation, and network resilience.

## In scope

- Chromium as the required baseline; additional engines as decided below.
- Active Home, Presentation, 404, and deferred-route guard journeys.
- Network interception for Presentation states.
- Keyboard/focus, automated accessibility, responsive overflow, color themes,
  reduced motion, image behavior, and production bundle checks.
- Performance smoke budgets aligned with existing feature specifications.

## Out of scope

- Public E2E article journeys before Blog activation.
- Validating third-party content or email-client completion.
- Visual pixel identity across every operating system/font rasterizer.
- Product analytics, which are not required.

## Browser test principles

- Run against a production build for release evidence; development-server tests
  may supplement debugging but cannot prove fixture isolation.
- Intercept the public Presentation endpoint with deterministic response bodies,
  delay, abort, malformed data, and status controls.
- Test 320 px, the 760 px CSS boundary on both sides, and a representative
  desktop width. Include long-content fixtures.
- Use keyboard actions for keyboard scenarios and inspect actual active element.
- Combine automated accessibility scans with explicit semantic/focus assertions.
- Prefer computed styles, bounding boxes, scroll dimensions, and reduced-motion
  timing over screenshots alone.

## Acceptance scenarios

### Active business funnel

#### BQA-001 — Complete discovery-to-contact journey (P0, Active)

- Given a production build and complete Presentation response
- When a visitor opens Home, reads the concise offer, activates Meet the
  engineer, reviews Presentation, and activates contact
- Then each business step is available in reading order
- And the contact control has the expected `mailto:` target

#### BQA-002 — Complete discovery-to-project-evidence journey (P0, Active)

- Given a project with live and source URLs
- When the visitor reaches Presentation and activates each action
- Then a new browsing context is requested with correct URL and no opener
  relationship

#### BQA-003 — Recover the business funnel after API failure (P0, Active)

- Given automatic requests fail and the manual retry succeeds
- When the visitor retries from Home and separately Presentation
- Then successful content replaces each error state without a full reload
- And navigation, route, theme, and conversion paths remain usable

#### BQA-004 — Use partial profile content (P0, Active)

- Given valid required profile with all optional fields/collections empty
- When Home and Presentation render
- Then no empty visual sections or dead actions remain
- And the core introduction plus contact fallback remain usable

### Routing, history, and production gate

#### BQA-010 — Direct-load and refresh every route class (P0, Active)

- Given production hosting supplies SPA fallback
- When `/`, `/presentation`, unknown, `/articles`, and `/articles/example` are
  opened directly and refreshed
- Then active routes render correctly and all other paths show shared 404

#### BQA-011 — Navigate with browser history (P1, Active)

- Given link navigation across Home, Presentation, and 404
- When Back and Forward are used
- Then content, title, active nav, top restoration, focus, and footer back action
  match each history entry

#### BQA-012 — Prove Blog production isolation (P0, Active)

- Given a production build with any Blog fixture environment flag
- When the app loads Home, Presentation, and article-like paths
- Then no article content, route, navigation link, fixture text, or Blog request
  becomes public

#### BQA-013 — Keep shell interactive during a slow request (P0, Active)

- Given Presentation response is deliberately delayed
- When loading UI is visible
- Then theme, Menu, active links, brand, skip link, and footer layout remain
  interactive without layout collapse

### Keyboard, focus, semantics, and announcements

#### BQA-020 — Complete the active journey by keyboard (P0, Active)

- Given a keyboard-only visitor
- When they traverse header, main actions/content, external evidence, and footer
- Then focus follows visual/document order, every action operates, no trap occurs,
  and focus indication is visible

#### BQA-021 — Use skip navigation (P1, Active)

- Given the page starts at the top
- When Tab reveals Skip to content and Enter activates it
- Then focus/navigation lands at the main landmark without traversing header
  controls again

#### BQA-022 — Restore route-heading focus (P0, Active)

- Given pointer and keyboard client-side navigation variants
- When a pathname changes
- Then the correct destination `h1` becomes active after the animation frame
- And focus does not become trapped or disappear behind the sticky header

#### BQA-023 — Operate compact menu by keyboard (P0, Active)

- Given a compact viewport
- When Menu is opened, links are traversed, Escape is pressed, and a destination
  is selected in separate runs
- Then expansion, order, active state, close behavior, and focus restoration match
  the shell specification

#### BQA-024 — Announce async states without duplication (P1, Active)

- Given delayed success, terminal error, and retry success
- When accessibility events are observed
- Then status/alert copy is exposed once per meaningful transition
- And decorative skeletons/icons add no noise

#### BQA-025 — Pass automated accessibility rules (P0, Active)

- Given Home success/loading/error, Presentation success/loading/error, 404,
  light/dark, compact/desktop combinations
- When an accessibility scanner runs
- Then there are no serious or critical violations
- And landmarks, headings, names, link purpose, list semantics, and attributes are
  also asserted explicitly

#### BQA-026 — Meet contrast and target-size requirements (P1, Active)

- Given light/dark and default/hover/focus/active states
- When computed colors and action boxes are evaluated
- Then WCAG 2.2 AA contrast applies and primary controls meet the documented
  44-by-44 CSS pixel baseline

### Responsive and content resilience

#### BQA-030 — Render at the 320 px minimum (P0, Active)

- Given 320 px width with long valid content
- When Home, Presentation, and 404 render
- Then the document has no horizontal overflow
- And hero, focus, projects, tags, timeline, footer, and actions remain readable

#### BQA-031 — Switch navigation around 760 px (P1, Active)

- Given widths just below, exactly at, and just above 760 px
- When the shell renders
- Then only the intended compact or desktop navigation is visibly available
- And no duplicate visible primary navigation confuses keyboard users

#### BQA-032 — Preserve layouts at representative desktop width (P1, Active)

- Given complete and long content at desktop width
- When pages render
- Then multi-column layouts preserve readable line lengths, no overlap occurs,
  and sticky header/footer content does not obscure actions

#### BQA-033 — Preserve project media dimensions (P2, Active)

- Given slow successful and failed image loads
- When Presentation renders
- Then intrinsic sizing avoids material content shift
- And failed media does not make project text/actions unusable

#### BQA-034 — Handle zoom and text enlargement (P1, Active)

- Given 200% browser zoom or equivalent text-size pressure
- When active pages render and navigation operates
- Then content reflows without loss, overlap, clipping, or two-dimensional page
  scrolling

### Theme and motion

#### BQA-040 — Initialize from system and storage in a browser (P0, Active)

- Given combinations of system scheme and stored valid/invalid/absent value
- When a new page is opened
- Then root theme and toggle label follow the documented precedence
- And reload preserves a manual choice

#### BQA-041 — Persist theme across routes and reload (P0, Active)

- Given a visitor toggles theme
- When they navigate, use history, and reload
- Then theme remains consistent and control label always describes the next mode

#### BQA-042 — Respect reduced motion (P0, Active)

- Given reduced-motion preference
- When route, menu, focus panel, status dot, theme, hover, and scroll behaviors run
- Then nonessential movement/transition is effectively removed
- And content/control availability is not delayed

#### BQA-043 — Keep standard motion bounded (P2, Active)

- Given normal motion preference
- When route and theme transitions occur
- Then motion completes within specified behavior, never blocks interaction, and
  repeated theme toggles leave no stuck switching class

### Network and lifecycle resilience

#### BQA-050 — Handle offline and server status failures (P0, Active)

- Given production mode with offline rejection, 404, 500, and 503 in separate
  runs
- When automatic retry exhausts
- Then page-specific generic recovery UI appears without exposing internal status
- And manual recovery works when connectivity returns

#### BQA-051 — Handle malformed success safely or expose approved gap (P1, Active)

- Given 2xx null, invalid JSON, missing arrays, and invalid dates
- When active routes render
- Then each matches its approved validation/error-boundary behavior
- Or, before hardening approval, a quarantined characterization test documents
  the known failure without counting as successful resilience

#### BQA-052 — Abort after navigation/unmount (P1, Active)

- Given an unresolved request
- When the visitor navigates and all observers release it or the app unmounts
- Then its signal aborts, no stale content overwrites the new route, and no
  unhandled rejection reaches the page

#### BQA-053 — Reuse cache across the funnel (P0, Active)

- Given Home resolves and the visitor immediately enters Presentation
- When network traffic is inspected within stale time
- Then no duplicate Presentation request occurs
- And footer/page content use the same publication snapshot

### Production quality gates

#### BQA-060 — Build without type or fixture leakage (P0, Active)

- Given production environment
- When the TypeScript/Vite build runs
- Then it succeeds, development fixtures cannot activate, and no secret/admin
  configuration is embedded

#### BQA-061 — Meet performance smoke budgets (P2, Active)

- Given representative mobile throttling and complete data
- When Lighthouse or equivalent runs against production build
- Then LCP is below 2.5 s, INP below 200 ms where measurable, and CLS below 0.1

#### BQA-062 — Keep network architecture coherent (P1, Active)

- Given a cold successful business journey
- When request timing is captured
- Then one composite Presentation request supplies the initial experience
- And no API waterfall or Blog request occurs

#### BQA-063 — Store browser artifacts on failure (P2, Active)

- Given an E2E check fails in CI
- When the job completes
- Then trace, screenshot, and relevant network/console diagnostics are retained
- And successful runs avoid unnecessary large artifacts

## Test evidence

- Production-build E2E suite using the chosen browser runner.
- Automated accessibility scans plus explicit keyboard and semantic assertions.
- Viewport/zoom/reduced-motion projects.
- Network interception and request-count evidence.
- Lighthouse/performance report and build inspection.

## Decisions and open questions

- Decision: Chromium is required; at least one WebKit or Firefox smoke project is
  recommended before approval.
- Decision: deferred article pages have no production E2E success journey until
  routes are approved.
- Decision: serious/critical automated accessibility violations fail CI; manual
  keyboard assertions remain mandatory.
- Question: choose CI browser matrix and whether performance budgets run on every
  pull request or on a scheduled/release job.
