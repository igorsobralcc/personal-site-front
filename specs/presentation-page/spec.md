# Feature: Presentation page

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-24

## Outcome

Visitors can evaluate Igor's background, capabilities, experience, and selected
work on a dedicated Presentation page without mixing long-form articles into
the portfolio narrative.

## In scope

- The `/presentation` route.
- Biography and professional approach.
- Skills grouped by category.
- Ordered experience entries.
- Ordered featured projects and their published external links.
- Contact and social links supplied by the Presentation API.
- Loading, empty, partial-data, and error behavior for the composite public
  presentation response.

## Out of scope

- Article summaries or article content.
- Administrative profile, experience, project, or skill editing.
- Downloadable resume generation.
- Testimonials, endorsements, and project case-study routes.
- Client-side reordering or filtering of presentation content.

## User experience

On success, the page introduces the professional profile, then presents
capabilities, selected projects, and experience in a deliberate reading order.
The UI preserves the API's published ordering and does not infer proficiency
scores or decorate skills with unsupported levels.

During loading, render a stable page heading and structural placeholders for
the major sections. If the response contains only the required profile, render
the profile and omit empty skills, projects, or experience sections. If a
section has partial records, render valid records and omit missing optional
fields within each record.

If no public profile exists, render a clear unavailable state with a route back
to Home. If the request fails, render a retryable page-level error without
replacing the shared navigation. External project and social links appear only
when a valid published URL is present.

## Responsive behavior

- Begin with one content column at 320 px.
- Stack profile summary and biography until both can maintain readable line
  lengths in a two-column composition.
- Stack skill groups vertically at narrow widths and align up to three peer
  groups only when labels fit without truncation.
- Project metadata moves below its title and summary before text becomes
  compressed.
- Experience dates precede role content in the reading order and move to a
  separate column only when enough inline space exists.
- Long organization names, technology labels, and URLs wrap without horizontal
  overflow.
- Reserve any project-media aspect ratio before loading; media is optional and
  must not be required to understand a project.

## Accessibility

- Use one `h1` for the page and ordered `h2` section headings.
- Represent experience and projects as semantic lists of articles.
- Skills use text labels grouped under meaningful headings; no meaning depends
  on color, position, or an unlabeled icon.
- Use `time` elements with machine-readable dates. Current roles expose
  “Present” as visible text.
- External links identify their destination in accessible names when the
  visible label alone is ambiguous.
- Decorative project arrows and visual marks are ignored by assistive
  technology.
- Loading, empty, partial, and error states are announced without moving focus
  unexpectedly.
- All controls and links meet the 44 by 44 CSS pixel primary-target baseline
  where they are presented as actions.

## Motion

Section reveals may use a single, short transform-and-opacity transition to
clarify reading order after content resolves. Project hover motion may use
transform only and must not move adjacent content. Do not animate the experience
timeline continuously or stagger every skill label.

Under `prefers-reduced-motion: reduce`, reveal and hover movement are removed;
content and focus states remain complete.

## API contract

Use the generated Presentation API client for:

```http
GET /api/v1/presentation
```

The approved public read model must provide:

- `profile`: name, headline, biography, location, contact email, and social
  links
- `skills[]`: stable identifier, category, name, and published order
- `experiences[]`: stable identifier, organization, role, summary, start date,
  nullable end date, and published order
- `projects[]`: stable identifier, title, summary, technology labels, featured
  status, external links, optional dimensioned media, and published order

Only published records are returned. The frontend trusts API order, treats a
null experience end date as current, and must not call protected administrative
routes. Generated types are the integration boundary; components must not call
`fetch` directly.

## Performance and resilience

- Make one composite presentation request and avoid profile/skills/experience/
  project waterfalls.
- Reuse a fresh response already cached by Home.
- Render textual content before optional project media.
- Lazy-load noncritical media below the fold and provide explicit intrinsic
  dimensions.
- Do not ship administrative credentials or draft metadata.
- Keep rendering linear in the number of returned records and avoid expensive
  scroll listeners.

## Analytics and telemetry

No Presentation-specific analytics are required.

## Acceptance scenarios

### Scenario: Render the complete presentation

- Given the public response contains a profile, skills, experience, and featured
  projects
- When the visitor opens `/presentation`
- Then every section renders in the specified reading order
- And records appear in API-provided order

### Scenario: Render partial presentation data

- Given the profile exists and the project collection is empty
- When the page renders
- Then the profile, skills, and experience remain complete
- And the projects section is omitted without an empty decorative container

### Scenario: Render a current role

- Given an experience entry has a null end date
- When the experience list renders
- Then its date range ends with visible text “Present”

### Scenario: Recover from a request failure

- Given the Presentation API request fails
- When the visitor activates Retry and the next request succeeds
- Then the error is replaced by the presentation content
- And keyboard focus remains in a logical position

### Scenario: Open a project link

- Given a featured project has a valid published external link
- When the visitor activates it
- Then the destination opens using secure external-link behavior
- And the accessible name identifies the project and destination purpose

## Test evidence

- Component: complete, loading, empty profile, partial sections, and error
  states.
- Component: current and historical date-range formatting.
- Contract: generated client compiles against the Presentation API OpenAPI
  document and expected fixture.
- Accessibility: landmarks, heading order, lists, links, dates, keyboard focus,
  and contrast.
- End-to-end: direct `/presentation` entry and Home-to-Presentation navigation at
  320 px and desktop widths in light, dark, and reduced-motion modes.
- Performance: one presentation request, cached reuse, lazy media, and layout
  stability verification.

## Decisions and open questions

- Decision: Presentation owns the complete portfolio narrative; Home contains
  only a summary.
- Decision: skills do not display inferred proficiency levels.
- Decision: empty optional collections remove their entire section.
- Question: confirm whether project media is part of the first public API
  contract or deferred.
