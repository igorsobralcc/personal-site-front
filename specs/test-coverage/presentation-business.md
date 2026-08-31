# Feature: Presentation business journey and data-boundary test suite

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Tests prove the active business funnel from concise introduction through
professional evaluation and contact, including every loading, partial, empty,
retry, malformed-data, and external-link branch.

## In scope

- Presentation API adapter and query hook.
- Shared query caching and request deduplication.
- Home profile hero and Presentation page.
- Footer email/location conversion behavior.
- Optional collections, fields, project media, links, and experience dates.
- Development fallback and production exception behavior.

## Out of scope

- Blog content on Home while publishing remains deferred.
- Administrative or authenticated Presentation operations.
- Verifying that an external website or mail application succeeds.

## API fixture matrix

Builders must support: complete valid response, profile-only response, empty
optional fields/collections, one omitted optional field at a time, current and
ended experiences, all project-link combinations, media present/absent,
malformed top-level values, missing arrays, malformed records, invalid dates,
and unsafe URL/email strings.

## Acceptance scenarios

### Presentation API adapter and query

#### PRE-001 — Send the default request (P0, Active)

- Given no endpoint environment override
- When `getPresentation` runs
- Then it fetches `/api/presentation` with the supplied AbortSignal and
  `Accept: application/json`

#### PRE-002 — Honor the configured endpoint (P1, Active)

- Given `VITE_PRESENTATION_API_URL` is configured at module load
- When the adapter runs
- Then it requests that exact public endpoint without adding credentials

#### PRE-003 — Return a successful contract (P0, Active)

- Given a 2xx response with a complete valid JSON body
- When the adapter resolves
- Then it returns the same ordered public read model

#### PRE-004 — Classify production HTTP failures (P0, Active)

- Given production mode and respectively 404, 400, 500, and 503 responses
- When the adapter runs
- Then 404 throws `Presentation unavailable`
- And other failures throw `Unable to load the presentation`

#### PRE-005 — Propagate production transport and parse failures (P0, Active)

- Given production mode and respectively network rejection or invalid JSON
- When the adapter runs
- Then the original rejection is propagated to the query boundary

#### PRE-006 — Use development prototype fallback (P0, Active)

- Given development mode and a non-abort HTTP, transport, or parse failure
- When the adapter runs
- Then representative prototype data resolves instead of an error

#### PRE-007 — Never mask an abort (P0, Active)

- Given development mode and an aborted signal
- When fetch rejects
- Then the rejection propagates and prototype data is not returned

#### PRE-008 — Characterize malformed success shapes (P0, Active gap)

- Given 2xx JSON is null, an array, profile-only without arrays, or contains
  wrong field types
- When the adapter resolves
- Then current pass-through behavior is recorded
- And downstream crash/blank behavior is covered without claiming validation

#### PRE-009 — Configure the presentation query (P1, Active)

- Given `usePresentation` mounts
- When its options are inspected through behavior
- Then key is exactly `['presentation']`, stale time is 60 seconds, and query
  cancellation reaches the adapter signal

#### PRE-010 — Deduplicate shared consumers (P0, Active)

- Given SiteShell and Home or Presentation mount under one QueryClient
- When all call `usePresentation`
- Then only one in-flight network request occurs
- And all consumers resolve from the same cached result

#### PRE-011 — Respect freshness and refetch lifecycle (P1, Active)

- Given presentation data resolved less than or more than 60 seconds ago
- When another consumer mounts
- Then fresh data avoids a refetch and stale data follows configured refetch
  behavior

#### PRE-012 — Apply application retry defaults (P1, Active)

- Given the production QueryClient and a transient request failure
- When the query executes
- Then one automatic retry occurs before page-level error
- And a component-test QueryClient can disable retries deterministically

### Home business flow

#### PRE-020 — Render pending Home without blocking progress (P0, Active)

- Given Presentation remains unresolved
- When Home renders
- Then the introduction status, heading-shaped loading state, and skeletons render
- And Meet the engineer plus shell navigation remain usable

#### PRE-021 — Render the complete concise profile (P0, Active)

- Given a complete profile response
- When Home resolves
- Then availability, headline, short summary, current focus, and Presentation CTA
  render
- And skills, projects, experience, and deferred articles do not render

#### PRE-022 — Fall back to biography (P0, Active)

- Given `shortSummary` is null or absent
- When Home resolves
- Then biography renders as the lede

#### PRE-023 — Omit availability cleanly (P0, Active)

- Given availability is null or absent
- When Home resolves
- Then neither availability text nor its decorative dot renders
- And no empty status container remains

#### PRE-024 — Omit current focus cleanly (P0, Active)

- Given current focus is null or absent
- When Home resolves
- Then the entire labeled focus aside is absent
- And the primary profile content remains complete

#### PRE-025 — Render and recover from Home error (P0, Active)

- Given production request/retries fail and a controlled retry later succeeds
- When Try again is activated
- Then the alert is replaced by profile content
- And pathname, CTA, shell, and footer remain intact throughout

#### PRE-026 — Keep Home independent of deferred Blog (P0, Active)

- Given Home renders in any Presentation state
- When network calls and links are inspected
- Then it neither requests Blog data nor renders Articles actions/latest-writing

#### PRE-027 — Characterize missing required profile data (P1, Active gap)

- Given headline or biography is missing/wrongly typed
- When Home renders
- Then current blank or failure behavior is captured for the validation/error-
  boundary decision

### Presentation evaluation flow

#### PRE-030 — Render page loading semantics (P0, Active)

- Given Presentation is unresolved
- When `/presentation` renders
- Then PageLoader identifies Loading presentation and the shell remains usable

#### PRE-031 — Render complete sections in business order (P0, Active)

- Given profile, skills, projects, and experiences are complete
- When the page resolves
- Then About → capabilities → Selected work → Experience render in intended
  reading order
- And records and nested records preserve API order

#### PRE-032 — Render profile fallbacks and optional focus (P0, Active)

- Given summary and current-focus combinations
- When the page resolves
- Then summary falls back to headline and current focus appears only when present

#### PRE-033 — Render and omit social profiles (P0, Active)

- Given zero or multiple social links
- When About renders
- Then an empty collection produces no list
- And multiple links preserve order, have `{label} profile` names, `_blank`, and
  `noreferrer`

#### PRE-034 — Render and omit capability sections (P0, Active)

- Given zero or multiple skill categories, including an empty skills list
- When the page resolves
- Then zero categories omit the grid
- And present categories/skills render as semantic grouped lists in API order

#### PRE-035 — Render all project link combinations (P0, Active)

- Given projects with neither URL, live only, repository only, or both
- When Selected work renders
- Then only supplied actions exist, no empty link group renders, and each name
  identifies project plus live/source purpose with secure new-tab behavior

#### PRE-036 — Render optional project media (P1, Active)

- Given a project image is present or absent
- When the project renders
- Then present media preserves URL, alt, intrinsic dimensions, lazy loading, and
  record position
- And absent media leaves complete textual content

#### PRE-037 — Preserve project technology order (P0, Active)

- Given multiple projects and technologies
- When tags render
- Then each project gets its own correctly named technologies list
- And technologies preserve API order without inferred proficiency

#### PRE-038 — Render ended and current experience dates (P0, Active)

- Given one experience has an end date and one has null/absent end date
- When the timeline renders
- Then dates format in English UTC at month/year precision
- And the active role ends with visible `Present`

#### PRE-039 — Omit each empty optional collection independently (P0, Active)

- Given profile plus any combination of empty skills, projects, or experiences
- When the page resolves
- Then only empty sections are absent
- And remaining sections stay complete with no empty decoration

#### PRE-040 — Recover from Presentation error (P0, Active)

- Given production request/retries fail and manual retry succeeds
- When Try again is activated
- Then the error alert is replaced by all presentation content
- And route and shared navigation remain unchanged

#### PRE-041 — Treat resolved undefined as an error (P1, Active)

- Given the query reports no error but has no data
- When PresentationPage renders
- Then the retryable page error renders rather than dereferencing data

#### PRE-042 — Characterize invalid dates (P1, Active gap)

- Given start or end date is invalid
- When experience formats it
- Then the current `RangeError` behavior is captured for a contract-hardening
  decision

#### PRE-043 — Characterize malformed collections (P1, Active gap)

- Given socialLinks, skills, projects, technologies, or experiences is missing or
  non-array
- When the page renders
- Then current render failure is captured and attributed to absent schema
  validation

#### PRE-044 — Characterize unsafe and malformed URLs (P1, Active gap)

- Given a social, project, repository, or image URL uses an unapproved protocol
  or malformed value
- When rendering occurs
- Then current trust behavior is captured
- And future allowed-protocol validation gets a separate failing test before fix

#### PRE-045 — Characterize project image failure (P2, Active)

- Given valid image markup whose resource fails to load
- When browser loading completes
- Then current browser fallback behavior is recorded
- And no nonexistent application fallback is asserted

### Contact conversion and cache reuse

#### PRE-050 — Render email conversion action (P0, Active)

- Given profile email exists
- When the footer resolves on Home, Presentation, and 404
- Then visible email and `mailto:` target match the contract value

#### PRE-051 — Render contact and location fallbacks (P0, Active)

- Given data is pending, failed, email absent, or location absent
- When the footer renders
- Then contact becomes non-interactive `Contact details coming soon`
- And location independently falls back to `Based in Brazil`

#### PRE-052 — Preserve location worldwide context (P1, Active)

- Given custom or fallback location
- When footer metadata renders
- Then it is followed by `Working worldwide` without malformed separators

#### PRE-053 — Prevent duplicate footer request (P0, Active)

- Given page and footer consume presentation simultaneously and after navigation
- When calls are counted
- Then one query request supplies both within the cache lifecycle

#### PRE-054 — Characterize unsafe email values (P1, Active gap)

- Given email contains whitespace, query/header characters, or an unexpected
  protocol-like value
- When the footer interpolates it
- Then current target construction is captured for contract validation work

## Test evidence

- Unit: Presentation adapter modes and exceptions.
- Hook integration: key, signal, stale/fresh behavior, retry, deduplication.
- Component: complete state matrix for Home, Presentation, and footer.
- Contract/security: malformed shapes, dates, URLs, email, public response only.
- E2E business funnel cross-referenced in `browser-quality.md`.

## Decisions and open questions

- Decision: characterization tests for malformed data document current risk and
  may initially expect a throw; they must be updated with approved resilience
  behavior rather than deleted.
- Decision: development fallback behavior is explicitly tested so it cannot hide
  production failure coverage.
- Question: approve runtime schema validation and a route-level error boundary as
  follow-up behavior before turning gap cases into graceful-state tests.
