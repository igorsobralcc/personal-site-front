# Engineering capability: Runtime contract validation

- Status: Implemented
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Unknown data crossing into the browser from APIs, environment configuration,
or persisted storage is validated before application code consumes it. Static
types come from the same schemas that enforce runtime behavior, and UI state
models cannot represent contradictory loading, success, empty, and error
states.

## In scope

- Zod schemas for the Presentation API and the retained Blog API boundary.
- Types inferred with `z.infer<typeof schema>` instead of separately maintained
  response interfaces.
- Validation of network JSON and development fixtures.
- Stable, sanitized contract errors suitable for TanStack Query error states.
- Discriminated unions for application-owned async view models where query
  state is transformed or combined.
- Tests for valid, malformed, additive, and unsupported payloads.

## Out of scope

- Changing either server API or claiming that client validation replaces the
  versioned OpenAPI contract.
- Validating trusted compile-time constants with schemas solely for ceremony.
- Replacing TanStack Query's state machine with duplicate React state.
- Rendering arbitrary server-provided HTML.
- Enabling the currently deferred public article routes.

## Boundary design

Add Zod as a production dependency because parsing executes in visitors'
browsers. Define schemas next to the API boundary or in a focused
`src/shared/api/schemas` directory. Export response types from their schemas:

```ts
export const presentationSchema = z.object({/* contract fields */})
export type Presentation = z.infer<typeof presentationSchema>
```

Do not maintain a parallel handwritten interface for the same wire response.
Domain or display types may remain separate only when an explicit adapter
converts a validated transport value into a meaningfully different model.

Each network function follows one sequence:

1. Fetch and verify the HTTP status.
2. Read the body as `unknown`.
3. Parse it with the operation's schema.
4. Return the inferred validated type, or throw a stable boundary error.

`response.json() as Promise<T>`, `response.json() as T`, and partial object
assertions are forbidden at API boundaries. Schema parsing occurs before values
enter the TanStack Query cache.

## Schema policy

Schemas encode the approved contract, including required versus nullable
fields, non-empty identifiers and labels, arrays, ISO date/date-time strings,
HTTP(S) URLs where applicable, positive integer media dimensions, and numeric
bounds. Optional and nullable are not interchangeable.

Unknown object keys are stripped or tolerated to preserve compatibility with
additive server changes. Missing required fields, invalid known fields, invalid
URLs, incorrect array shapes, and invalid known content blocks fail parsing.
The parser must not silently invent required business data.

Development fixtures are parsed by the same schema before they are returned.
This turns fixture drift into a test or development failure rather than a false
success path. Presentation's development fallback remains available only under
`import.meta.env.DEV` and never converts an abort into fixture success.

## Article block compatibility

Article bodies retain forward-compatible unknown-block behavior required by
the article-reader specification:

- Every known discriminator (`paragraph`, `heading`, `quote`, `list`, `code`,
  `image`, and `table`) is checked against its complete schema.
- A malformed block with a known discriminator fails the article contract; it
  must not be mislabeled as merely unsupported.
- A genuinely unknown discriminator is normalized to a typed unsupported-block
  variant containing only safe metadata such as its original type.
- The renderer exhaustively switches over the resulting discriminated union
  and displays the existing neutral unsupported-content message for the
  unsupported variant.

Raw unknown block properties are not rendered, logged, or interpolated into the
DOM.

## Error contract

Introduce a recognizable `ApiContractError` (or equivalently named error) for
schema failures. It may expose the operation name and sanitized field paths for
diagnostics, but never response bodies, credentials, tokens, or visitor data.
HTTP errors and the existing `ArticleNotFoundError` remain distinguishable from
contract errors so retry policy and user messaging stay intentional.

The public UI uses the existing safe unavailable/malformed-content states; it
does not reveal raw Zod issues. Tests and development diagnostics may inspect
the sanitized error cause. Aborted requests remain aborts and must not be
reported as malformed data.

## UI state policy

When a component combines query state, cached data, or multiple requests into
an application-owned view model, model the result as a discriminated union, for
example:

```ts
type ViewState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
```

Each variant contains only fields valid for that status. Consumers use an
exhaustive switch with a `never` check. Simple components may consume TanStack
Query's already-discriminated result directly; they must not mirror it into
multiple booleans or duplicate local state.

Empty is a valid parsed payload interpreted by feature policy. It is not a
schema error. Partial optional data is valid when the server contract marks it
optional and the UI omits the affected detail without layout artifacts.

## Accessibility and user experience

Validation does not create a new visual language. Loading, empty, partial-data,
and error experiences remain those specified for their features. A malformed
response resolves to the feature's accessible error state, announces once, and
offers retry when retry can plausibly recover. Previously rendered valid cached
data is not replaced with contradictory UI state during a background refresh.

## Performance and security

- Parse each response once at the network boundary, not again in every
  component.
- Avoid importing unused schema groups into route bundles when the Blog feature
  is deferred.
- Never use `eval`, dynamic code generation, or raw HTML to validate or render
  content.
- Do not include complete invalid payloads in thrown errors or telemetry.
- Measure the production bundle change and record it with implementation
  evidence; an unexpected large increase requires investigation.

## Acceptance scenarios

### Scenario: Accept a valid presentation

- Given the Presentation API returns a payload satisfying the schema
- When `getPresentation` resolves
- Then it returns the inferred `Presentation` type
- And the validated value is the value stored in the query cache

### Scenario: Reject a malformed presentation

- Given a required nested Presentation field is absent or has the wrong type
- When the boundary parses the response
- Then it throws `ApiContractError`
- And no partially trusted payload reaches a page component

### Scenario: Tolerate an additive server field

- Given an otherwise valid response contains an unknown object property
- When the boundary parses it
- Then parsing succeeds according to the documented unknown-key policy
- And application behavior is unchanged

### Scenario: Keep development fixtures honest

- Given a development fixture no longer satisfies its operation schema
- When a fixture-backed request or its contract test runs
- Then validation fails before the fixture reaches the UI

### Scenario: Preserve unsupported article content behavior

- Given an article body contains a well-formed block with an unknown type
- When the response is parsed and rendered
- Then surrounding known blocks remain available
- And only the unknown block becomes the typed unsupported-content variant

### Scenario: Reject malformed known article content

- Given an image block omits required alt text or has invalid dimensions
- When the article response is parsed
- Then the complete response fails with a contract error
- And unsafe or incomplete content is not rendered

### Scenario: Prevent an impossible view state

- Given a feature derives an application-owned async view model
- When TypeScript checks its consumers
- Then a state cannot be both loading and successful
- And adding a new status produces an exhaustive-switch type failure until it
  is handled

## Test evidence

Implementation evidence recorded on 2026-08-31:

- Seven focused contract tests cover valid, malformed, additive, empty,
  partial, known-block, unknown-block, payload-sanitization, and live malformed
  Presentation cases.
- The full 12-test Vitest suite passes.
- The production build succeeds with a 358.78 kB JavaScript bundle (110.92 kB
  gzip); this is the first recorded schema-validation baseline.
- TypeScript and type-aware ESLint pass without response assertions or explicit
  `any` at the API boundaries.

- Unit contract tests for every operation schema with representative valid and
  invalid fixtures.
- Tests for optional, nullable, empty-array, additive-field, malformed-known-
  block, and unknown-block cases.
- API boundary tests proving parsing precedes caching/consumption and preserves
  HTTP, not-found, abort, and contract error distinctions.
- Component tests proving malformed data reaches the accessible error state and
  valid partial data retains feature-specific behavior.
- Type-level compilation fixture or exhaustive-switch test for discriminated
  view state.
- Production bundle-size comparison recorded in the implementation evidence.

## Decisions and open questions

- Decision: Zod schemas are the source of frontend transport types.
- Decision: parsing happens once at the network boundary and includes local
  fixtures.
- Decision: additive object fields are tolerated; invalid known fields are not.
- Decision: unknown article block types remain forward-compatible, while
  malformed known types fail closed.
- Decision: TanStack Query state is not copied into redundant local state.
- Question: when the Presentation OpenAPI client is generated, decide whether
  schemas are generated from that contract or maintained with automated drift
  tests; there must still be one frontend source of truth.
