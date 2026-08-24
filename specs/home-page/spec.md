# Feature: Home page

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-24

## Outcome

Visitors understand who Igor is, what kind of work he does, and how to continue
to the fuller Presentation or the latest Articles without reading a long
single-page portfolio.

## In scope

- The `/` route.
- A concise availability statement, professional headline, introduction, and
  current-focus summary.
- Primary navigation actions to Presentation and Articles.
- A latest-writing section containing the newest two published articles.
- Article links that open the canonical `/articles/:slug` route.
- Presentation and article data reuse through generated API clients and the
  shared TanStack Query cache.

## Out of scope

- Full biography, complete skill groups, experience, and project history.
- Full article archive, search, filters, tags navigation, and pagination.
- Newsletter signup or contact form.
- Draft or scheduled article previews.

## User experience

On success, Home leads with basic profile information and two clear choices:
learn more on Presentation or read Articles. The latest-writing section shows
the two newest published articles in API order with publication date, title,
summary, and reading time.

While presentation data is loading, reserve the hero's text structure with a
non-animated skeleton and keep navigation available. While articles are
loading, render a labeled loading state only in the latest-writing section.

If no published articles exist, replace the article list with a short message
that writing is coming soon and retain the action to the Articles page. If the
profile is partially populated, omit optional availability or current-focus
content without leaving blank containers. The headline and introduction remain
required.

If the Presentation API fails, render a compact error message in the hero with
a retry action and keep the shared shell usable. If the Blog API fails, keep the
hero intact and show an independent article-loading error with a retry action.
One failed service must not suppress successful content from the other.

## Responsive behavior

- At 320 px, stack hero copy, actions, current-focus summary, and article rows.
- Primary hero actions fill the available inline width only when their labels
  would otherwise wrap awkwardly.
- Enhance the hero to two columns when the copy and focus summary both retain
  comfortable line lengths; do not fix the breakpoint to a device class.
- Latest article metadata wraps above its title at narrow widths and aligns in
  columns only when the content fits.
- Prevent long titles, dates, and translated content from causing horizontal
  overflow.
- Reserve summary dimensions to avoid layout shift when data resolves.

## Accessibility

- Use one page `h1`, followed by a labeled latest-writing section with an `h2`.
- Express availability in text; the decorative status dot is ignored by
  assistive technology.
- Use links for route navigation and article destinations.
- Article link names include the article title; arrows are decorative.
- Loading text is exposed with polite status semantics without repeatedly
  announcing skeleton elements.
- Retry controls are keyboard accessible, visibly labeled, and at least 44 by
  44 CSS pixels.
- Empty and error messages do not rely on color alone.

## Motion

The current-focus summary may enter with a single short transform-and-opacity
transition after the hero text is present. Latest articles may update without
staggered reveals. No animation runs while waiting for API responses.

Under `prefers-reduced-motion: reduce`, all reveal transitions are omitted and
resolved content replaces loading content immediately.

## API contract

### Presentation API

Use the generated client for:

```http
GET /api/v1/presentation
```

Required public fields:

- `profile.headline`
- `profile.biography` or a dedicated short summary field
- `profile.availability` when published
- `profile.currentFocus` when published

The exact generated property names must follow the approved Presentation API
OpenAPI document. If a short summary, availability, or current-focus field does
not exist, its contract must be approved in the Presentation API before this
specification can be approved.

### Blog API

The Blog API has no approved public contract yet. Home requires an approved,
cacheable operation equivalent to:

```http
GET /api/v1/articles?limit=2
```

Required fields for each published article summary:

- stable identifier
- `slug`
- `title`
- `summary`
- `publishedAt`
- `readingTimeMinutes`
- optional primary topic or tag

The response must contain published articles only, ordered newest first. The
frontend must consume the generated Blog API client; page and feature
components must not call `fetch` directly.

## Performance and resilience

- Home may request Presentation and Blog data concurrently.
- Reuse both responses on subsequent routes through TanStack Query; do not
  duplicate server state in a client store.
- Keep article summaries text-only unless an approved contract supplies
  optimized, dimensioned media.
- Avoid making article data part of LCP when the headline can render first.
- A Blog API timeout or failure must not delay successful profile content.

## Analytics and telemetry

No Home-specific analytics are required.

## Acceptance scenarios

### Scenario: Understand the site from Home

- Given published profile content is available
- When the visitor opens `/`
- Then the professional headline, introduction, and current focus are visible
- And links to Presentation and Articles are available without scrolling past
  unrelated portfolio detail

### Scenario: Open a latest article

- Given at least two published articles exist
- When the visitor activates a latest article title
- Then the application navigates to `/articles/:slug`
- And the selected article is rendered by the Article reader feature

### Scenario: Render fewer than two articles

- Given the Blog API returns one published article
- When Home renders
- Then that article is shown without an empty placeholder for a second article

### Scenario: Render no articles

- Given the Blog API returns no published articles
- When Home renders
- Then a coming-soon message replaces the list
- And the Articles navigation remains available

### Scenario: Isolate a Blog API error

- Given Presentation data succeeds and the Blog API fails
- When Home renders
- Then the complete hero remains visible
- And the latest-writing section shows a retryable error

### Scenario: Render partial optional profile data

- Given the required profile fields exist but availability and current focus do
  not
- When Home renders
- Then the optional elements are omitted
- And the hero has no blank panel or unexplained gap

## Test evidence

- Component: hero success and optional-field omission.
- Component: latest-writing loading, zero, one, two, and error states.
- Integration: concurrent generated-client queries and independent retry paths.
- Accessibility: heading order, loading announcements, article link names, and
  keyboard operation.
- End-to-end: Home-to-Presentation and Home-to-article journeys at 320 px and
  desktop widths, including reduced motion.
- Performance: verify no request waterfall and no layout shift from resolved
  article metadata.

## Decisions and open questions

- Decision: Home is intentionally concise and does not duplicate the full
  Presentation page.
- Decision: Home shows at most two latest published articles.
- Question: approve the Blog API public article-summary operation and schema.
- Question: decide whether the Presentation API needs explicit short-summary,
  availability, and current-focus fields.
