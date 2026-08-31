# Feature: Deferred Article reader, SEO, and content-safety test suite

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

The inactive article detail adapter, query, page, structured-content renderer,
and metadata lifecycle are proven across success, privacy-neutral not-found,
retry, malformed, unsupported, and unsafe-content flows before public activation.

## In scope

- `getArticle`, `useArticle`, ArticlePage, and every `Block` branch.
- Fixture conversion, slug encoding, retry classification, and abort.
- Loading, not-found, error, success, optional metadata, and empty body.
- Document title and canonical lifecycle.
- Structured block semantics, local overflow, lazy media, invalid structures,
  and protocol/security characterization.

## Out of scope

- Enabling article routes/navigation.
- Arbitrary HTML rendering, embeds, scripts, code-copy, syntax highlighting,
  comments, analytics, or authoring.
- Server-side sanitization implementation.

## Acceptance scenarios

### Detail adapter, fixtures, and query

#### ARD-001 — Resolve a known fixture article (P1, Deferred)

- Given guarded fixture mode and a known slug
- When `getArticle` runs
- Then no fetch occurs and summary/body data resolves
- And deck maps to paragraph, note maps to quote, and other prototype block types
  retain their intended type/text/order

#### ARD-002 — Classify an unknown fixture slug (P1, Deferred)

- Given guarded fixture mode and an unknown slug
- When detail loads
- Then `ArticleNotFoundError` is thrown

#### ARD-003 — Construct an encoded detail request (P1, Deferred)

- Given fixture mode is disabled and slug contains spaces, slash, Unicode, or
  reserved characters
- When `getArticle` runs
- Then `encodeURIComponent(slug)` forms one path segment
- And Accept JSON plus the supplied signal are sent without credentials

#### ARD-004 — Return a valid detail contract (P1, Deferred)

- Given 2xx detail JSON with valid summary fields and body array
- When the adapter resolves
- Then the complete article and optional metadata are returned

#### ARD-005 — Classify network 404 privately (P1, Deferred)

- Given the endpoint returns 404
- When detail loads
- Then `ArticleNotFoundError` is thrown with no distinction among missing,
  draft, scheduled, or unpublished content

#### ARD-006 — Reject non-404, transport, and parse failures (P1, Deferred)

- Given non-2xx other than 404, network rejection, or invalid JSON
- When detail loads
- Then the failure reaches query error handling

#### ARD-007 — Reject malformed summary and body (P1, Deferred)

- Given each required summary field is absent or body is missing/non-array
- When validation runs
- Then the relevant malformed-content error is thrown

#### ARD-008 — Propagate detail abort (P1, Deferred)

- Given an in-flight detail request is aborted
- When fetch rejects
- Then cancellation propagates without becoming not-found or content

#### ARD-009 — Configure query identity and enabled state (P1, Deferred)

- Given nonempty or empty slug
- When `useArticle` mounts
- Then key is `['articles', slug]`, stale time is 60 seconds, and only nonempty
  slug enables adapter execution

#### ARD-010 — Apply retry classification (P1, Deferred)

- Given ArticleNotFoundError or repeated generic failures
- When hook retry logic runs
- Then not-found gets no retry
- And generic failure gets exactly one automatic retry

### Page states and navigation

#### ARD-020 — Render loading state (P1, Deferred)

- Given a nonempty slug with unresolved detail
- When ArticlePage renders directly in a test route
- Then an article status with focusable loading heading and skeleton renders

#### ARD-021 — Render privacy-neutral not-found (P1, Deferred)

- Given detail returns ArticleNotFoundError
- When the page resolves
- Then `Article not found` and generic unavailable text render
- And semantic actions target Articles and Home without exposing publication state

#### ARD-022 — Render terminal error and retry (P1, Deferred)

- Given generic automatic retries fail and manual retry later succeeds
- When Try again is activated
- Then the alert is replaced by the full article
- And the slug/path remains unchanged

#### ARD-023 — Treat success without article as error (P1, Deferred)

- Given query is not pending/not explicitly errored but data is absent
- When the page renders
- Then the generic retryable load error renders

#### ARD-024 — Render complete article semantics (P1, Deferred)

- Given a valid article with all optional metadata and representative body
- When it resolves
- Then back link, metadata, one article h1, deck, and ordered body render
- And publication date uses English UTC with machine-readable source value

#### ARD-025 — Omit optional metadata cleanly (P1, Deferred)

- Given topic and/or reading time is null or absent
- When the article header renders
- Then absent metadata creates no empty spans or separators

#### ARD-026 — Render an empty body (P2, Deferred)

- Given a valid article with `body: []`
- When it resolves
- Then header and metadata remain complete and body contains no placeholder

#### ARD-027 — Keep back navigation deterministic (P1, Deferred)

- Given direct entry or index-origin navigation
- When Back to Articles is activated
- Then it targets `/articles` semantically rather than calling browser history

#### ARD-028 — Characterize an empty slug mount (P2, Deferred gap)

- Given ArticlePage mounts without a slug
- When the disabled query settles in its current state
- Then current pending/no-request behavior is captured for a dedicated-state
  decision

#### ARD-029 — Characterize invalid publication date (P1, Deferred gap)

- Given malformed `publishedAt`
- When the header formats it
- Then current RangeError behavior is captured

### Structured content renderer

#### ARD-030 — Render paragraph, heading, and quote (P1, Deferred)

- Given each valid text block
- When rendered in body order
- Then it becomes respectively `p`, `h2`, and `blockquote` with exact text

#### ARD-031 — Render ordered and unordered lists (P1, Deferred)

- Given list blocks with ordered true, false, or absent and multiple items
- When rendered
- Then semantic `ol`/`ul` and ordered `li` content appear

#### ARD-032 — Render code labels (P1, Deferred)

- Given code with and without language
- When rendered
- Then `pre > code` preserves exact whitespace
- And the preformatted region is named `{language} code` or `Code`

#### ARD-033 — Render accessible dimensioned images (P1, Deferred)

- Given a valid image with and without caption
- When rendered
- Then figure/image preserve URL, required alt, intrinsic width/height, and lazy
  loading
- And figcaption renders only when supplied

#### ARD-034 — Render accessible tables (P1, Deferred)

- Given caption, headers, and rows
- When rendered
- Then the focusable scroll region is named by caption
- And table caption, column headers/scopes, and row cells preserve order

#### ARD-035 — Replace unknown blocks locally (P1, Deferred)

- Given an unknown block between two valid blocks
- When the body renders
- Then only the unknown block becomes the neutral unsupported message
- And valid neighbors remain readable in order

#### ARD-036 — Replace structurally invalid known blocks (P1, Deferred)

- Given each known type with missing/wrong text, items, code, image fields, or
  table fields
- When it renders
- Then it follows the unsupported-block path rather than dereferencing invalid
  properties

#### ARD-037 — Preserve duplicate list/table values (P2, Deferred)

- Given repeated items, headers, or cells
- When rendered
- Then all contract entries remain visible despite index-based React keys

#### ARD-038 — Characterize inconsistent table dimensions (P1, Deferred gap)

- Given rows shorter/longer than headers or non-string cells hidden behind an
  unsafe cast
- When rendered
- Then current permissive rendering/failure is captured for schema enforcement

#### ARD-039 — Keep code and tables locally scrollable (P1, Deferred)

- Given long code and a wide table at 320 px
- When a real browser renders the article unit harness
- Then local regions can scroll without page-level horizontal overflow

### Title, canonical, and security

#### ARD-040 — Set SEO title with fallback (P1, Deferred)

- Given seoTitle is present or absent
- When the article resolves
- Then document title is respectively `{seoTitle} — Igor` or `{title} — Igor`

#### ARD-041 — Create canonical metadata with fallback (P1, Deferred)

- Given no canonical link exists and canonicalUrl is present or absent
- When the article resolves
- Then one canonical element is appended with API URL or current location

#### ARD-042 — Update across article changes (P1, Deferred)

- Given the mounted reader changes from one resolved slug/article to another
- When the metadata effect reruns
- Then title and canonical represent only the latest article

#### ARD-043 — Clean up a created canonical (P1, Deferred)

- Given ArticlePage created the canonical element
- When it unmounts
- Then that element is removed exactly once

#### ARD-044 — Characterize pre-existing canonical removal (P0, Deferred gap)

- Given the document already contains a canonical element owned by the host
- When ArticlePage updates it and unmounts
- Then the current cleanup removal is captured as a regression risk
- And ownership-safe behavior must be specified before route activation

#### ARD-045 — Characterize unsafe canonical/image protocols (P0, Deferred gap)

- Given canonicalUrl or image URL uses javascript, data, file, or another
  unapproved protocol
- When rendered
- Then current trust behavior is captured
- And an allowed-protocol test must fail before security hardening is implemented

#### ARD-046 — Treat script-like text as inert (P0, Deferred)

- Given paragraph, heading, quote, list, code, caption, header, or cell strings
  contain HTML/script-like text
- When React renders structured blocks
- Then text is escaped and no element/event handler is created from the string

#### ARD-047 — Confirm absent arbitrary HTML path (P0, Deferred)

- Given an article block attempts to supply raw HTML or embed fields
- When rendered
- Then it follows unsupported content and no dangerously-set HTML path exists

#### ARD-048 — Characterize incomplete SEO fields (P2, Deferred gap)

- Given seoDescription or social-image data exists
- When ArticlePage resolves
- Then current code does not emit those metadata fields
- And activation approval decides whether they are required

### Public feature gate

#### ARD-050 — Keep reader unreachable in App (P0, Active)

- Given all deferred reader unit tests pass
- When a visitor opens any `/articles/:slug` in the real App
- Then shared 404 renders and neither detail adapter nor fixtures execute

## Test evidence

- Unit: adapter/fixtures and each renderer branch/invalid shape.
- Hook integration: enabled state, key, signal, retry classification.
- Component: all page states, navigation, metadata lifecycle.
- Security: inert text, unsupported HTML, URL protocol characterization.
- Browser harness: local overflow and metadata behavior before route activation.

## Decisions and open questions

- Decision: canonical ownership and URL protocol gaps are activation blockers,
  even if global coverage already exceeds 90%.
- Decision: content strings are rendered as React text, never arbitrary HTML.
- Question: approve the production content-block schema, safe URL allowlist, and
  SEO requirements before promoting this specification.
