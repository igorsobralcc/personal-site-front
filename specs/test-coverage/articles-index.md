# Feature: Deferred Articles index and Blog feed test suite

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Inactive article feed, archive, and pagination code is comprehensively tested
without exposing it through the public router. The suite becomes activation
evidence once the Blog contract is approved.

## In scope

- Blog feed API adapter, development fixtures, `useArticles`, ArticlesPage, and
  ArticleRow.
- Initial, empty, partial, malformed, retry, continuation, and duplicate flows.
- Query construction, abort propagation, cursor semantics, and metadata.
- Public feature-gate assertions through the active router.

## Out of scope

- Enabling article routes or primary navigation.
- Article detail rendering, specified separately.
- Search, filtering, tags navigation, analytics, or authoring.

## Acceptance scenarios

### Feed adapter and fixtures

#### AIX-001 — Use fixtures only under the guarded development condition (P1, Deferred)

- Given `DEV` and `VITE_USE_BLOG_FIXTURES` combinations are evaluated at module
  load
- When `getArticles` runs
- Then fixtures are used only when DEV is true and the flag is not exactly false
- And fixture mode makes no fetch call

#### AIX-002 — Paginate fixture summaries (P1, Deferred)

- Given fixture mode, limit 2, and successive null/`2` cursors
- When pages are requested
- Then summaries preserve prototype order, required field mapping, parsed reading
  time, unique prototype IDs, and correct next cursors

#### AIX-003 — Characterize invalid fixture cursors (P2, Deferred gap)

- Given nonnumeric, negative, fractional, or extreme cursors
- When fixture pagination runs
- Then current Number/slice semantics are captured for a validation decision

#### AIX-004 — Construct the network feed URL (P1, Deferred)

- Given default/configured endpoint, limit, optional cursor, and current origin
- When the network adapter runs
- Then it sets `limit`, includes only a truthy cursor, sends Accept JSON and the
  supplied signal, and does not send credentials

#### AIX-005 — Normalize a valid feed response (P1, Deferred)

- Given valid required summaries and string, null, absent, or non-string cursor
- When the response resolves
- Then summaries retain API order
- And only a string cursor is returned; all other cursor states become null

#### AIX-006 — Reject feed HTTP and parsing failures (P1, Deferred)

- Given non-2xx, network rejection, or invalid JSON
- When the adapter runs
- Then the failure reaches the query boundary

#### AIX-007 — Reject malformed feed envelopes and summaries (P1, Deferred)

- Given missing/non-array items or each missing required summary field
- When normalization runs
- Then `The article feed returned malformed content` is thrown

#### AIX-008 — Preserve optional summary fields (P1, Deferred)

- Given topic, reading time, and image are present, null, or absent
- When summaries normalize
- Then the adapter preserves contract values without inventing defaults

#### AIX-009 — Propagate feed abort (P1, Deferred)

- Given the supplied signal aborts during fetch
- When the adapter rejects
- Then cancellation reaches TanStack Query without being converted to data

### Infinite query behavior

#### AIX-010 — Configure list query identity and first page (P1, Deferred)

- Given default or custom limit
- When `useArticles` mounts
- Then key is `['articles', limit]`, first page parameter is null, stale time is
  60 seconds, and the selected limit reaches the adapter

#### AIX-011 — Translate cursor to continuation state (P1, Deferred)

- Given a page with string or null next cursor
- When query state derives the next page
- Then string enables the exact next request and null ends pagination

#### AIX-012 — Cancel on unmount or supersession (P2, Deferred)

- Given an unresolved list request
- When its observer unmounts or query is replaced
- Then the request signal aborts and no stale state is committed

### Articles page states

#### AIX-020 — Render stable pending state (P1, Deferred)

- Given the first page is unresolved
- When ArticlesPage renders directly in a test router
- Then page introduction remains visible and a named loading status renders

#### AIX-021 — Render initial error and retry (P1, Deferred)

- Given first request fails and controlled retry succeeds
- When Try again is activated
- Then the archive alert is replaced by article content without route loss

#### AIX-022 — Render an empty archive (P1, Deferred)

- Given a successful first page with no items
- When the page resolves
- Then `No articles yet` renders
- And no featured card, archive list, or continuation remains

#### AIX-023 — Feature a single article exactly once (P1, Deferred)

- Given one valid summary
- When the page resolves
- Then it renders as featured with date, title, summary, and detail action
- And no archive list duplicates it

#### AIX-024 — Feature newest and archive the rest in API order (P1, Deferred)

- Given multiple summaries
- When the page resolves
- Then the first unique item is featured once
- And remaining unique items render as an ordered visual list in received order

#### AIX-025 — Deduplicate IDs across all pages (P1, Deferred)

- Given duplicate IDs within one page or across continuation pages with changed
  content
- When flattened items render
- Then only the first occurrence remains

#### AIX-026 — Characterize duplicate slugs with different IDs (P2, Deferred)

- Given two summaries have different IDs but the same slug
- When the archive renders
- Then both current records render and target the same detail route

#### AIX-027 — Omit optional metadata without gaps (P1, Deferred)

- Given topic and/or reading time is null or absent
- When featured and row variants render
- Then absent values produce no empty spans or punctuation gaps

#### AIX-028 — Format dates in English UTC (P1, Deferred)

- Given a timestamp that crosses a local date boundary
- When featured and row dates render
- Then both show the UTC calendar date with matching `dateTime`

#### AIX-029 — Characterize invalid dates (P1, Deferred gap)

- Given malformed `publishedAt`
- When either summary variant renders
- Then current RangeError behavior is captured for contract validation

#### AIX-030 — Build accessible detail links (P1, Deferred)

- Given featured and archive summaries with complex titles/slugs
- When their links render and are activated
- Then the accessible names include the title and navigation targets the selected
  `/articles/:slug` path through React Router

### Pagination

#### AIX-040 — Load and append a continuation (P1, Deferred)

- Given first page has a next cursor
- When Load more articles is activated
- Then the exact cursor is requested, the control disables and changes label,
  the polite announcement is emitted, and unique results append in order

#### AIX-041 — Remove continuation at the terminal page (P1, Deferred)

- Given the appended page has no next cursor
- When it resolves
- Then loading state clears and no continuation control remains

#### AIX-042 — Preserve content after continuation failure (P1, Deferred)

- Given existing items and a failed next-page request
- When failure state renders
- Then existing content remains readable
- And a separate alert plus `Retry loading more` control render

#### AIX-043 — Retry only the failed continuation (P1, Deferred)

- Given continuation failed and its retry later succeeds
- When the retry control is activated
- Then first-page data is not discarded/refetched by the action
- And continuation results append once

#### AIX-044 — Prevent duplicate rapid continuation (P2, Deferred)

- Given a continuation is already in flight
- When repeated activation is attempted
- Then disabled control/query state prevents a duplicate request

#### AIX-045 — Characterize repeated/cyclic cursors (P2, Deferred gap)

- Given the server returns the same or a previously used next cursor
- When continuation completes
- Then current query behavior is captured for a loop-protection decision

### Public feature gate

#### AIX-050 — Keep page unreachable in App (P0, Active)

- Given article page units pass their deferred tests
- When the real App route table and primary navigation render
- Then ArticlesPage is still unreachable and no Articles link exists

## Test evidence

- Unit: adapter normalization, fixture guard/pagination, malformed input.
- Hook integration: key, cursors, abort, stale time, continuation state.
- Component: full ArticlesPage and ArticleRow state/metadata matrix.
- Router integration: public feature gate only; no active article E2E yet.

## Decisions and open questions

- Decision: deferred code counts toward the 90% threshold.
- Decision: unit/component tests import deferred pages without registering routes.
- Question: approve duplicate-slug and cursor-cycle handling in the Blog contract
  before route activation.
