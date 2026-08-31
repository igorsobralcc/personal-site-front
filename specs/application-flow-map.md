# Application flow map

- Scope: Front-end application
- Status: Test-planning baseline
- Last reviewed: 2026-08-31
- Sources: implemented routes, pages, query hooks, API adapters, shared shell, and feature specifications

## Purpose and scope boundary

This map inventories the user-visible and supporting flows that should drive the
next test suite. It gives priority to the site's business purpose: helping a
visitor understand Igor's professional fit, evaluate evidence, and make contact.

There are two product states in the repository:

- **Active public scope:** Home (`/`), Presentation (`/presentation`), the shared
  shell, and the catch-all not-found route.
- **Deferred publishing scope:** Articles index and reader are implemented in
  source but intentionally absent from the route table and navigation until the
  Blog API contract is approved. Today, `/articles` and `/articles/:slug` must
  behave as unknown routes and must not expose article content.

Tests must keep these states separate. Deferred-flow tests should target the
page, hook, and API units directly until product approval activates their routes.

## Business journey overview

```text
Direct entry / search / shared link
                |
                v
       Home: understand fit
       |                 |
       |                 +--> contact email in footer
       v
Presentation: evaluate biography, capabilities, work, and experience
       |                 |
       |                 +--> open project or source evidence
       |                 +--> open social profile
       +--------------------> contact email in footer

Future publishing phase:
Home / primary navigation --> Articles index --> Article reader
```

Business success means a visitor can complete this funnel even when optional
content is absent, on a narrow viewport, with keyboard or assistive technology,
and after a recoverable API failure.

## Actors and dependencies

- **Visitor:** anonymous; there are no authentication, account, authoring,
  personalization, checkout, form-submission, or consent flows.
- **Browser:** owns route history, viewport, focus, scroll, system color
  preference, and persisted theme preference.
- **Presentation API:** provides the complete public profile read model used by
  Home, Presentation, and the shared footer.
- **Blog API:** future public feed and article-detail dependency; not active in
  the public route graph.
- **External destinations:** `mailto:`, project sites, source repositories, and
  social profiles.

## State and request model

- Home, Presentation, and SiteShell call the same `usePresentation` query.
  TanStack Query deduplicates them through the `['presentation']` key.
- Presentation data is fresh for 60 seconds. The application-wide query client
  retries failed queries once; tests create a client with retries disabled.
- Route changes preserve the query cache. They do not create a separate client
  store or a second footer request.
- In Vite development, any non-abort Presentation fetch failure is replaced by
  prototype data. Production propagates the failure to the page-level state.
- Article list queries use `['articles', limit]`; detail queries use
  `['articles', slug]`. Both are fresh for 60 seconds.
- Article detail retries non-not-found failures once and never retries an
  `ArticleNotFoundError` at hook level. Application defaults can otherwise
  affect retry timing and must be controlled explicitly in tests.

## Active business flows

### BF-01 — Understand the offer on Home

**Trigger:** direct entry to `/`, brand link, Home navigation link, footer back
link, or browser history.

**Happy path:**

1. The shared shell renders while Presentation data is requested.
2. Home exposes a loading introduction without blocking navigation.
3. The API profile resolves.
4. Home renders availability when present, the required headline, and
   `shortSummary`; biography is the summary fallback.
5. Current focus renders as a labeled panel when present.
6. The visitor activates **Meet the engineer** and reaches `/presentation`.

**Business rules:** Home remains concise; it does not duplicate skills,
projects, or experience. Optional availability and current focus are omitted
without empty containers. The Presentation call is public and credential-free.

**Exceptions and variants:**

- Pending request: loading heading and skeletons appear; CTA remains available.
- Network, server, response parsing, or production endpoint failure: an alert
  replaces the introduction and offers **Try again**; the CTA and shell remain.
- Retry succeeds: profile content replaces the alert without changing route.
- `shortSummary` is null or absent: biography renders.
- Availability absent: no status line or decorative dot renders.
- Current focus absent: no focus panel renders and the hero becomes one-sided.
- Required profile content absent or malformed: there is no runtime schema
  validation or error boundary; blank/invalid rendering or a render exception is
  possible. This is an uncovered failure boundary, not a handled state.

### BF-02 — Evaluate the complete professional presentation

**Trigger:** direct entry to `/presentation`, primary navigation, Home CTA, or
browser history.

**Happy path:**

1. A page-level loader renders while the shared Presentation query resolves.
2. The profile introduction and biography render.
3. Social profiles render in API order when provided.
4. Skill categories and their skills render in API order.
5. Projects render in API order, with optional dimensioned media, optional live
   and source links, and technology tags.
6. Experience renders in API order with semantic dates.
7. The visitor evaluates evidence and continues through an external link or the
   footer contact action.

**Business rules:** the client never infers skill proficiency or reorders
published content. Empty optional collections remove their entire sections.
A null experience end date displays **Present**. Each external project link
identifies the project and purpose, opens a new tab, and uses `rel="noreferrer"`.

**Exceptions and variants:**

- Request pending: a stable presentation loader is announced.
- Request fails or resolves without data: a page-level connection alert offers
  **Try again** while shell navigation remains usable.
- Retry succeeds: the complete page replaces the error state.
- `shortSummary` absent: headline is used for the page introduction.
- `currentFocus` absent: the second biography paragraph is omitted.
- Social links empty: the list is omitted.
- Skills, projects, or experiences empty: only that whole section is omitted.
- Project image absent: project remains understandable as text.
- Live URL absent, repository URL absent, or both absent: only validly present
  actions render; an empty project-links container does not.
- Reading an active role: null/absent `endDate` becomes **Present**.
- Invalid date string: `Intl.DateTimeFormat.format(new Date(value))` can throw a
  `RangeError`; there is no local recovery UI.
- Invalid or unsafe external URL: the current UI trusts API strings and renders
  them. Contract validation and allowed-protocol coverage are still required.
- Missing arrays or malformed records: direct property access/map calls can
  throw. There is no response schema validation or React error boundary.
- Image load failure: browser broken-image behavior is shown; no fallback or
  error copy is implemented.

### BF-03 — Convert through contact

**Trigger:** visitor reaches the footer on any active or unknown route.

**Happy path:**

1. SiteShell reuses Presentation query data.
2. When `profile.email` exists, a `mailto:` link displays the same address.
3. Activating it hands off to the browser/operating-system mail client.
4. Location displays as `{location} · Working worldwide`.

**Exceptions and variants:**

- Data pending, unavailable, or email absent: **Contact details coming soon**
  renders as non-interactive text.
- Location absent or data unavailable: **Based in Brazil · Working worldwide**
  renders.
- Presentation API fails on Home or Presentation: contact gracefully degrades
  independently but shares the same failed query state.
- Invalid email content is interpolated without validation; protocol/header
  injection and whitespace cases need contract tests.
- Mail-client launch/cancellation is outside application control; an end-to-end
  test should assert the `mailto:` target rather than external application state.

### BF-04 — Validate work and public identity externally

**Trigger:** live-project, source-repository, or social-profile action on
Presentation.

**Happy path:** the link has a destination-specific accessible name, opens in a
new browsing context, and prevents opener access through `noreferrer`.

**Exceptions and variants:** absent URLs omit controls. Dead remote pages,
blocked popups, offline state after navigation, and third-party errors are
external to this application; tests assert link semantics and security, not
remote success. Unsafe or malformed API URLs are currently not rejected.

## Active supporting flows

### SF-01 — Direct entry and client-side navigation

- `/` renders Home and title **Igor — Software Engineer**.
- `/presentation` renders Presentation and title **Presentation — Igor**.
- Client navigation and browser Back/Forward preserve the shell and cached data.
- Each pathname change closes the mobile menu, scrolls to the top with instant
  behavior, updates the title, and schedules focus on the first `main h1`.
- The non-home footer exposes **Back to Home**; Home omits it.
- Query strings and fragments do not affect title selection because only
  `location.pathname` is considered.

**Exceptions:** an early route state without an `h1` makes the scheduled focus a
safe no-op. A route whose heading is replaced after data resolution is not
automatically refocused. `window.scrollTo` or `requestAnimationFrame` absence in
non-browser environments requires test shims.

### SF-02 — Unknown and deferred routes

- Any unmatched pathname renders the shared 404 page, title **Page not found —
  Igor**, the normal header/footer, and a Home link.
- `/articles`, `/articles/:slug`, administrative-looking paths, malformed slugs,
  and deeper nested paths are all unknown in the active route table.
- No deferred article component should mount and no Blog API request should be
  made for these routes.
- Returning Home through the page action, brand, navigation, footer, or browser
  history restores the normal Home flow.

### SF-03 — Primary navigation

- Desktop navigation exposes exactly Home and Presentation.
- The current exact route uses `aria-current="page"`.
- The brand always links to Home with an accessible name.
- At widths up to 760 px CSS hides desktop navigation and shows the labeled Menu
  control. Opening it exposes the same destinations in document order.
- Activating a destination closes the mobile menu and navigates.
- Activating Menu again closes it. Escape while open closes it and returns focus
  to Menu. Escape while closed is a no-op.
- A route change from another source also closes an open menu.

**Exceptions:** clicking outside, changing viewport width, and losing focus do
not explicitly close the menu. These are current behaviors to lock or revisit,
not implied requirements.

### SF-04 — Theme preference

1. On first provider initialization, a stored `light` or `dark` value wins.
2. If storage is missing or invalid, system dark preference selects dark;
   otherwise light is selected.
3. The selected theme is placed on `document.documentElement.dataset.theme` and
   persisted to local storage.
4. Toggle switches to the opposite theme, updates its accessible label, adds a
   temporary switching class, and clears it after 650 ms.
5. Repeated clicks clear the prior timer before starting the next one. Unmount
   clears the timer.

**Exceptions:** localStorage read/write can throw (privacy/security/quota) and
`matchMedia` may be unavailable; neither has a fallback. System preference
changes after initialization are not observed. Cross-tab storage changes are
not observed. These cases need either explicit non-support decisions or code
hardening before expecting recovery tests to pass.

### SF-05 — Keyboard and assistive-technology navigation

- The first focusable control is a skip link that targets `#main`.
- The shell supplies header, named primary navigation, main, and footer
  landmarks.
- Page states use status, live-region, or alert semantics where implemented.
- Route headings are programmatically focusable with `tabIndex={-1}`.
- Decorative icons, the availability dot, project numbering, and visual article
  arrows are hidden from assistive technology where implemented.
- Native links/buttons retain keyboard behavior and visible focus styling.

**Exception/coverage boundary:** visual focus order, color contrast, target size,
screen-reader announcement duplication, and focus after asynchronous retry need
browser/accessibility tests; jsdom component tests cannot prove them alone.

### SF-06 — Responsive layout and motion

- The layout supports a 320 px minimum and switches to the compact navigation
  and single-column content at 760 px.
- Long prose, labels, tags, images, code, and tables must avoid page-level
  horizontal overflow. Code and tables may scroll locally.
- At reduced-motion preference, animation and transition durations collapse,
  smooth scrolling is disabled, and navigation/theme transitions are removed.
- Scroll and resize calculate a clamped 0-to-1 CSS progress value from document
  height. Route cleanup removes listeners and the custom property.

**Exceptions:** a non-scrollable document produces progress 0; overscroll and
negative positions are clamped. Resize recalculates. Actual CSS layout and
reduced-motion behavior require browser tests at representative widths.

### SF-07 — Presentation API boundary

**Request:** configured `VITE_PRESENTATION_API_URL`, otherwise
`/api/presentation`, with abort signal and `Accept: application/json`.

**Outcomes:**

- 2xx valid JSON: returned to all Presentation consumers.
- 404: throws **Presentation unavailable** in production.
- Other non-2xx: throws **Unable to load the presentation** in production.
- Network rejection or invalid JSON: propagated in production.
- Abort: always propagated and never replaced by fixtures.
- Any other failure in development: returns prototype Presentation data.

**Unhandled contract exceptions:** a 204 response, JSON `null`, wrong object
shape, missing arrays, and invalid field types are not validated at the API
boundary. Tests should expose these as current gaps rather than asserting a
graceful state that does not exist.

## Deferred publishing flows

### DF-00 — Publishing feature gate (current production rule)

The route and primary navigation remain disabled until the Blog API feed,
detail, privacy, pagination, and safe-content contracts are approved. The P0
test is that article URLs render 404 and issue no Blog request. The flows below
are implemented units and future activation criteria, not current public E2E
journeys.

### DF-01 — Browse the article archive

1. Opening the future `/articles` route requests the first page with limit 8 and
   no cursor.
2. Loading renders a status region beneath the stable page header.
3. The first unique item is featured exactly once; remaining unique items form
   the archive in API order.
4. Topic and reading time are omitted when absent. Dates render in UTC.
5. Activating a featured or archive link navigates to its encoded route slug.

**Exceptions and variants:**

- Empty success: **No articles yet** replaces featured/archive content.
- Initial request failure, non-2xx, invalid JSON, missing `items`, or malformed
  required summary fields: page-level alert and retry.
- Duplicate IDs across or within pages: only the first item remains.
- Duplicate slugs with different IDs are not removed and can target the same
  detail route.
- Invalid publication date can throw during rendering; no recovery boundary.
- A non-string `nextCursor` is treated as the end of the archive.
- `nextCursor` cycles or returns the same cursor: the UI can continue requesting;
  there is no loop detection.

### DF-02 — Continue the article archive

1. When `nextCursor` exists, **Load more articles** renders.
2. Activating it disables the button and changes the label to **Loading more
   articles…** with a polite live announcement.
3. Success appends new unique summaries in API order.
4. No next cursor removes the continuation control.

**Exceptions:** a continuation failure preserves existing content, changes the
button to **Retry loading more**, and shows a separate alert. Retrying calls only
the continuation. Rapid activation is constrained by the disabled state, but
request/cursor behavior should be verified at hook integration level.

### DF-03 — Read an article

1. Direct entry or an index link supplies `slug` to `useArticle`.
2. Loading preserves the route and renders an article status.
3. Valid content renders topic/reading-time when present, publication date,
   title, summary, and ordered body blocks.
4. The back link always targets `/articles` rather than depending on history.
5. The document title uses `seoTitle`, falling back to title.
6. A canonical link uses `canonicalUrl`, falling back to current URL, and is
   removed when the article effect cleans up.

**Supported blocks:** paragraph, level-two heading, quote, ordered/unordered
list, code with optional language label, dimensioned lazy image with optional
caption, and captioned table in a focusable scroll region.

**Exceptions and variants:**

- 404 becomes `ArticleNotFoundError`: show the privacy-neutral not-found state
  with Articles and Home actions; do not retry.
- Other non-2xx/network error: retry once at hook level, then show a retryable
  alert without changing route.
- Invalid summary fields or non-array body: treat as request error.
- Unknown or structurally invalid block: replace only that block with the
  unsupported-content message and preserve surrounding content.
- Empty body: metadata and header render with no body blocks.
- Empty slug disables the query; this state has no dedicated UI and can remain
  pending if mounted directly.
- Unsafe image/canonical URLs and malformed table dimensions are trusted; the
  current renderer has no protocol/schema allowlist.
- The canonical cleanup removes the selected canonical element even when it
  existed before the article mounted. This should be regression-tested and
  resolved before route activation.
- SEO description, social image metadata, and safe-link rendering inside article
  content are not currently implemented.

### DF-04 — Blog API and development fixtures

- Fixtures are used only when `DEV` is true and
  `VITE_USE_BLOG_FIXTURES !== 'false'`; when active, no Blog HTTP request occurs.
- Fixture pagination converts cursor to a number, slices summaries, and returns
  the next numeric cursor.
- Unknown fixture slug becomes `ArticleNotFoundError`.
- Network list request sends `limit` and optional cursor query parameters,
  `Accept: application/json`, and abort signal.
- Detail request URL-encodes the slug and sends the same header/signal.
- Production builds cannot activate fixtures through the environment flag alone.

**Fixture exceptions:** non-numeric, negative, or extreme cursors are not
validated and follow JavaScript slice semantics. Fixture body conversion only
models a subset of the production block contract, so fixture success is not a
substitute for contract tests.

## Exception inventory by recovery behavior

| Failure class                                | User-visible result today                                       | Recovery                        | Test intent                                           |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| Presentation pending                         | Home inline loader / Presentation page loader / footer fallback | Automatic resolve               | Assert shell stays usable                             |
| Presentation transient failure in production | Home or Presentation alert                                      | Query retry, then manual retry  | Assert route and shell persist                        |
| Presentation failure in development          | Prototype success                                               | None needed                     | Assert abort is not masked; document masking behavior |
| Presentation 404                             | Same page error in production                                   | Manual retry                    | Do not expose internal status detail                  |
| Presentation malformed shape                 | Possible blank UI or render crash                               | None                            | Gap test; requires validation/error boundary decision |
| Optional presentation field absent           | Element or section omitted / defined fallback                   | Not applicable                  | Assert no empty decoration or punctuation             |
| Unknown/deferred route                       | Shared 404                                                      | Link/navigation/history to Home | Assert no private/deferred fetch                      |
| Theme storage/system API failure             | Provider render may throw                                       | None                            | Gap test; requires resilience decision                |
| External destination failure                 | Browser/third-party behavior                                    | Outside app                     | Assert only URL and security semantics                |
| Blog initial failure (deferred)              | Archive alert                                                   | Manual retry                    | Component/integration test only                       |
| Blog continuation failure (deferred)         | Existing items + alert + retry label                            | Retry continuation              | Assert no duplicate/lost items                        |
| Article 404 (deferred)                       | Privacy-neutral article not found                               | Browse Articles / Home          | Assert no retry and no state leakage                  |
| Article transient failure (deferred)         | Automatic retry, then alert                                     | Manual retry                    | Assert slug/route retained                            |
| Unsupported article block (deferred)         | Local neutral placeholder                                       | Continue reading                | Assert neighboring blocks survive                     |
| Malformed/unsafe article fields (deferred)   | Error or unsafe rendering, depending on field                   | Incomplete                      | Gap/security tests before activation                  |

## Test backlog and priorities

### P0 — Protect active business behavior

- **T-P0-01:** Home loading → success renders headline, preferred summary,
  availability, focus, and Presentation CTA.
- **T-P0-02:** Home omits optional profile elements and falls back from summary
  to biography without blank containers.
- **T-P0-03:** Home production failure → alert → manual retry success; shell and
  CTA remain operable.
- **T-P0-04:** Presentation full success preserves API order across skills,
  projects, technologies, social links, and experience.
- **T-P0-05:** Presentation independently omits empty skills, projects,
  experiences, and social links; current role displays **Present**.
- **T-P0-06:** Presentation error → retry success without route loss; footer
  fallback remains available during failure.
- **T-P0-07:** Footer renders API email/location, correct `mailto:`, and both
  documented fallbacks without issuing a duplicate Presentation request.
- **T-P0-08:** Project/social links render only when present and have correct
  accessible names, targets, and `rel` security.
- **T-P0-09:** `/articles`, `/articles/example`, and arbitrary unknown paths show
  shared 404 and never call the Blog API.
- **T-P0-10:** Home → Presentation → Back/Forward updates route, title, active
  navigation, scroll, focus, footer back link, and reuses cached data.
- **T-P0-11:** API adapter covers valid JSON, 404, other non-2xx, network error,
  invalid JSON, abort, development fallback, and production propagation.
- **T-P0-12:** Contract-gap tests characterize null/malformed Presentation
  responses before choosing runtime validation and an error boundary.

### P1 — Cross-cutting usability and resilience

- **T-P1-01:** Mobile Menu open, toggle-close, destination-close, Escape-close
  with focus restoration, and route-change close.
- **T-P1-02:** Keyboard route journey validates skip link, focus order, active
  state, unique heading, and persistent landmarks.
- **T-P1-03:** Theme initialization covers stored light, stored dark, invalid
  storage + system dark/light, toggling, persistence, label update, rapid
  toggles, timer cleanup, and reload.
- **T-P1-04:** Browser tests at 320 px, 760 px boundary, and desktop cover no
  page overflow, navigation mode, target sizes, image sizing, and long content.
- **T-P1-05:** Reduced-motion browser test verifies no meaningful route, menu,
  focus-panel, status-dot, or theme animation.
- **T-P1-06:** Scroll progress covers no scroll range, midpoint, negative and
  excessive positions, resize, route change, and cleanup.
- **T-P1-07:** Accessibility automation covers landmarks, heading order, names,
  status/alert announcements, lists, dates, contrast, and visible focus.
- **T-P1-08:** Decide and then test behavior for localStorage/matchMedia failure,
  invalid dates, malformed URLs, and image-load failure.

### P1 — Deferred feature-gate unit coverage

- **T-DP1-01:** Article feed adapter: query construction, headers, signal, valid
  response, non-2xx, invalid JSON, missing items, malformed item, cursor
  normalization, and fixture guard.
- **T-DP1-02:** Articles page: loading, error/retry, empty, one item, feature plus
  archive, optional metadata, duplicate IDs, and navigation slug.
- **T-DP1-03:** Pagination: loading/disabled announcement, append order,
  deduplication, terminal cursor, continuation error, and continuation retry.
- **T-DP1-04:** Article detail adapter/hook: encoded slug, enabled state, 404
  classification/no retry, transient retry, malformed summary/body, and abort.
- **T-DP1-05:** Article page: loading, success, optional metadata, direct entry,
  404 privacy, retry success, empty body, back link, title, and canonical lifecycle.
- **T-DP1-06:** Renderer covers every supported block, each invalid block shape,
  unknown blocks between valid blocks, lazy dimensioned images, code labels,
  captioned table semantics, and narrow-width overflow.
- **T-DP1-07:** Security characterization covers script-like text, unsafe URL
  protocols, canonical injection, image URL policy, and malformed table data.

### P2 — Quality gates

- Production build contains no active Blog route or fixture activation path.
- Network integration proves a single composite Presentation request per cache
  lifecycle and no request waterfall.
- Browser tests cover direct refresh and history at each active route.
- Production bundle and Lighthouse checks enforce LCP, INP, CLS, and responsive
  accessibility targets from the feature specifications.
- Cross-browser smoke coverage includes no configured endpoint, offline mode,
  slow response, and API response arriving after route navigation/unmount.

## Recommended automation layers

| Layer             | Best targets                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Pure/unit         | date and block formatting, response validation, URL construction, query retry predicates                         |
| Component         | every page state, optional-field omission, section order, link semantics, mobile menu, theme provider            |
| Integration       | query cache deduplication, retry transitions, pagination, abort/unmount, route/title/focus behavior              |
| End-to-end        | core business funnel, direct entry/history, contact target, responsive layout, theme persistence, reduced motion |
| Accessibility     | landmarks/headings/names in components; focus/contrast/target size/announcements in a real browser               |
| Contract/security | Presentation and Blog schemas, public-only fields, URL protocols, malformed data, fixture/production isolation   |

## Existing evidence and largest gaps

Current `App.test.tsx` covers public navigation visibility, deferred-route 404,
mobile Menu open/Escape-close, shared shell on unknown routes, and one light to
dark persistence path. It does not yet cover the primary business content,
Presentation ordering/partial data, retry recovery, footer conversion, external
links, API adapters, request deduplication, route title/focus/history, responsive
behavior, or any deferred article unit.

The highest-risk gaps before expanding tests are:

1. No runtime validation for the Presentation response and no application error
   boundary for render-time contract failures.
2. Development fallback hides all non-abort Presentation failures, including
   malformed JSON and 404, which can make local failure testing misleading.
3. Theme initialization assumes localStorage and matchMedia are always usable.
4. Dates and external URLs are trusted contract inputs.
5. Deferred article canonical and URL/content safety behavior needs resolution
   before public route activation.

## Definition of flow-map completion

The map is complete for the current repository when each P0 case is automated or
explicitly marked as an accepted unsupported condition, each active exception
has a named recovery expectation, and deferred article activation is guarded by
both the current 404 tests and the listed contract/security suite.
