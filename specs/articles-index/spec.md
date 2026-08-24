# Feature: Articles index

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-24

## Outcome

Visitors can browse all published technical articles from a dedicated Articles
page and open a stable, shareable article route.

## In scope

- The `/articles` route.
- A featured newest article followed by the remaining published article
  summaries.
- Publication date, title, summary, reading time, and optional primary topic.
- Canonical links to `/articles/:slug`.
- An initial bounded feed and a progressively loaded continuation when the
  approved API reports more results.
- Loading, empty, partial-data, and error states.

## Out of scope

- Full-text search, tag filters, sorting controls, and archive-by-date views.
- Article authoring, preview, drafts, scheduling, or publication controls.
- Comments, reactions, bookmarks, and reading-history personalization.
- Article body rendering, which belongs to the Article reader feature.

## User experience

On success, the newest published article receives featured treatment and the
remaining summaries form a quiet chronological list. Each entry is one link to
its article route. The page does not duplicate the featured entry in the list.

While loading the first page, preserve the page heading and render non-animated
structural placeholders. If no articles exist, show a concise empty state. If
some article summaries contain missing optional topics, render the remaining
metadata without gaps. Required-field violations are reported as an operational
error and the affected record is not rendered as a broken link.

If the first request fails, render a page-level retry action. If a continuation
request fails, preserve already loaded articles and show a retry action at the
continuation boundary. Loading more results must not move focus to the top or
replace existing content.

## Responsive behavior

- At 320 px, stack featured artwork above the featured article copy.
- Render each article's metadata above its title and summary at narrow widths.
- Align metadata, article copy, reading time, and arrow in columns only when all
  values fit without truncation.
- Long titles and localized dates wrap naturally and never cause horizontal
  overflow.
- Any featured artwork uses a reserved aspect ratio and does not become the LCP
  element unless it is optimized and immediately available.
- A continuation control fills the available width only when its label would
  otherwise wrap awkwardly.

## Accessibility

- Use one page `h1` and a semantic list of article entries.
- Each article has a descriptive link whose accessible name includes its title.
- Use `time` elements with machine-readable publication dates.
- Reading time is supporting text and is not announced as an interactive
  control.
- Featured artwork is decorative when it repeats no unique information; useful
  editorial images require meaningful alternative text from the API.
- Loading continuation state is announced politely. New entries are appended
  without forcing focus.
- Retry and continuation controls are keyboard accessible and at least 44 by 44
  CSS pixels.
- Empty and error states do not rely on color alone.

## Motion

Newly appended article rows may use a short opacity transition, without
staggering or moving existing rows. Featured artwork has no looping or parallax
motion.

Under `prefers-reduced-motion: reduce`, appended results appear immediately and
all decorative motion is removed.

## API contract

The Blog API has no approved public contract yet. This feature requires an
approved, cacheable operation equivalent to:

```http
GET /api/v1/articles?cursor={cursor}&limit={limit}
```

Required response data:

- `items[]`
  - stable identifier
  - `slug`
  - `title`
  - `summary`
  - `publishedAt`
  - `readingTimeMinutes`
  - optional primary topic or tag
  - optional editorial image URL, width, height, and alt text
- nullable continuation cursor or equivalent `hasMore` signal

The operation returns published articles only, ordered by `publishedAt`
descending with a stable tie-breaker. Cursors must not expose drafts. The
frontend consumes a generated Blog API client and does not call `fetch`
directly.

## Performance and resilience

- Request a bounded initial result set; the exact limit is decided with the
  approved Blog API contract.
- Reuse summaries cached by Home and avoid refetching them solely to render the
  first index rows.
- Do not download article bodies for the index.
- Lazy-load and dimension optional imagery; prefer text-first rendering.
- Preserve loaded content during background refresh and continuation failures.
- Public responses should support HTTP caching through the generated client
  boundary.

## Analytics and telemetry

No Articles-index analytics are required.

## Acceptance scenarios

### Scenario: Render the article archive

- Given multiple published articles exist
- When the visitor opens `/articles`
- Then the newest article is featured once
- And all remaining entries appear newest first

### Scenario: Open an article

- Given a published article summary is visible
- When the visitor activates its link
- Then the application navigates to `/articles/:slug`
- And the slug matches the selected summary

### Scenario: Render an empty archive

- Given the Blog API returns no published articles
- When the page renders
- Then a concise no-articles message is shown
- And no featured placeholder or empty row remains

### Scenario: Continue the archive

- Given the response reports more published articles
- When the visitor activates the continuation control
- Then the next summaries are appended once in API order
- And focus remains on the continuation control or moves to a newly available
  continuation control

### Scenario: Recover from continuation failure

- Given some articles are already rendered and the next request fails
- When the failure is displayed
- Then existing articles remain readable
- And retry requests only the failed continuation

## Test evidence

- Component: loading, populated, one-item, empty, partial optional fields, and
  initial-error states.
- Component: continuation success, duplicate prevention, end of results, and
  retry after failure.
- Contract: generated Blog API client compiles against the approved OpenAPI
  document and published-only fixtures.
- Accessibility: heading, semantic list, descriptive links, dates, live loading
  state, and keyboard continuation.
- End-to-end: `/articles` direct entry, Home-to-Articles navigation, and article
  selection at 320 px and desktop widths.
- Performance: bounded first response, no body downloads, cached-summary reuse,
  and dimensioned-media verification.

## Decisions and open questions

- Decision: the Articles page does not initially include search or filters.
- Decision: the newest article is featured and not duplicated in the list.
- Question: approve the Blog API feed route, cursor model, result limit, schema,
  and cache behavior.
- Question: decide whether editorial images are included in the first Blog API
  contract.
