# Feature: Article reader

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-24

## Outcome

Visitors can read and share a published technical article at a stable URL with
clear typography, complete metadata, accessible structured content, and
predictable missing-article behavior.

## In scope

- The nested `/articles/:slug` route under the Articles top-level navigation.
- Article title, summary, publication date, reading time, optional topic, and
  rendered body.
- A semantic path back to `/articles`.
- Canonical metadata required for link sharing and search indexing.
- Loading, unavailable, malformed-content, and request-error behavior.
- Safe rendering of the Blog API's approved article content format.

## Out of scope

- Draft preview, authoring, editing, scheduling, and publication workflow.
- Comments, reactions, bookmarks, text highlighting, and reading progress.
- Related-article recommendations.
- Client-side syntax-highlighting libraries unless separately specified after
  the article format is approved.

## User experience

Direct entry and article-summary navigation render the same canonical article
route. The reading view begins with a back link, article metadata, title, and
summary, followed by a comfortably sized body column.

During loading, preserve the page location and render a stable heading-shaped
placeholder. If the slug does not identify a published article, render an
Article not found heading with links to Articles and Home. Draft, scheduled, and
unpublished slugs behave exactly like missing slugs.

If optional topic or reading time is absent, omit it without punctuation gaps.
If the body contains an unsupported block, preserve surrounding valid content
and render a neutral unsupported-content message in place of that block. If the
request fails, show a retry action and retain navigation.

## Responsive behavior

- Use one readable body column from 320 px upward.
- Bound line length at larger widths instead of stretching prose across the
  full page.
- Let title, metadata, code, tables, and long identifiers wrap without causing
  page-level horizontal overflow.
- Code blocks may use a locally scrollable region when wrapping would change
  meaning; the page itself must not scroll horizontally.
- Tables reflow when possible and use a labeled, locally scrollable wrapper only
  when their column relationships require it.
- Images reserve intrinsic dimensions, scale to the body width, and never exceed
  their natural aspect ratio.

## Accessibility

- Render the article in an `article` landmark with one `h1` and correctly nested
  body headings.
- Use semantic paragraphs, lists, block quotes, code, figures, captions, links,
  and tables produced by the approved renderer.
- Expose publication date through a `time` element.
- The back control is a semantic link to `/articles`, not browser-history-only
  behavior.
- Code blocks expose an accessible language label when known. Any copy-code
  enhancement requires a visible label and status announcement.
- Images require meaningful API-provided alt text unless explicitly decorative.
- Link styling is distinguishable without relying only on color.
- Loading and error states announce once without moving focus unexpectedly.
- Focus lands on the article `h1` after client-side navigation from a summary.

## Motion

The article body does not animate paragraph-by-paragraph. A single short
route-level transition may clarify navigation into the reader. No parallax,
reading-progress animation, or looping media is introduced.

Under `prefers-reduced-motion: reduce`, the route transition and smooth scroll
are removed.

## API contract

The Blog API has no approved public contract yet. This feature requires an
approved, cacheable operation equivalent to:

```http
GET /api/v1/articles/{slug}
```

Required published article fields:

- stable identifier
- `slug`
- `title`
- `summary`
- `publishedAt`
- optional `updatedAt`
- `readingTimeMinutes`
- optional primary topic and tags
- rendered content in one approved safe format
- canonical URL or enough configuration to derive it
- SEO title and description, with defined fallback rules
- optional social image URL and intrinsic dimensions

The API returns published content only. Missing, draft, scheduled, and
unpublished slugs return the same not-found response. The content format and
sanitization boundary must be approved in the Blog API specification before
this frontend specification can be approved.

The frontend uses the generated Blog API client. Components must not call
`fetch` directly or trust arbitrary HTML from the network. If HTML is selected
as the API format, server-side sanitization and a defense-in-depth client policy
must be documented. If structured blocks are selected, the supported block
schema and unknown-block behavior must be versioned.

## Performance and resilience

- Fetch only the selected article body; do not preload every article from the
  index.
- Reuse cached summary metadata while the body request is pending.
- Lazy-load noncritical images with intrinsic dimensions.
- Avoid a large syntax-highlighting runtime in the initial article bundle.
- Make article HTML or block rendering deterministic to support prerendering or
  server rendering if adopted later.
- Emit canonical metadata without an additional client request.

## Analytics and telemetry

No reading analytics, scroll-depth tracking, or behavioral telemetry is
required.

## Acceptance scenarios

### Scenario: Read a published article

- Given a slug identifies a published article
- When the visitor opens `/articles/:slug`
- Then the article metadata, title, summary, and body render in semantic order
- And Articles remains the active top-level navigation item

### Scenario: Open an article directly

- Given the visitor has not previously loaded the Articles index
- When they open a valid article URL directly
- Then the complete article renders without depending on index state
- And the back link leads to `/articles`

### Scenario: Handle an unpublished or unknown slug

- Given the slug is missing, draft, scheduled, or unpublished
- When the route resolves
- Then the same Article not found state is rendered
- And no private metadata or publication state is exposed

### Scenario: Render an unsupported content block

- Given a published article contains one block type unknown to this frontend
- When the body renders
- Then supported blocks before and after it remain readable
- And a neutral unsupported-content message replaces only the unknown block

### Scenario: Recover from a request error

- Given the article request fails transiently
- When the visitor activates Retry and the next request succeeds
- Then the error is replaced by the complete article
- And the canonical route remains unchanged

### Scenario: Read code on a narrow viewport

- Given an article contains a long code line
- When it renders at 320 px
- Then the code block can be inspected without causing page-level horizontal
  scrolling
- And surrounding prose remains at the page width

## Test evidence

- Component: loading, published, optional metadata, not-found, request-error,
  unsupported-block, and malformed-content states.
- Contract: generated Blog API client and content renderer compile against the
  approved OpenAPI and content-block schemas.
- Security: sanitization or structured-block allowlist tests reject scripts,
  event handlers, unsafe URLs, and unsupported embeds.
- Accessibility: article semantics, heading hierarchy, dates, links, images,
  code, tables, focus placement, and announcements.
- End-to-end: index-to-reader, Home-latest-to-reader, direct entry, not-found,
  Back navigation, 320 px code overflow, dark mode, and reduced motion.
- Performance: article route bundle, lazy images, cached summary reuse, and no
  archive-body preload.

## Decisions and open questions

- Decision: article detail is a nested route under the Articles top-level page,
  not a fourth primary navigation destination.
- Decision: the back link always targets `/articles`; it does not depend solely
  on browser history.
- Question: approve the Blog API detail route, not-found privacy behavior,
  content format, sanitization boundary, SEO fields, and cache behavior.
- Question: decide whether articles require code-copy controls in the first
  release.
