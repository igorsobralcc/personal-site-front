# Feature: Coverage foundation and governance

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Contributors receive deterministic coverage results for all executable front-end
code, and CI rejects changes that reduce statements, branches, functions, or
lines below 90%. Coverage remains evidence of behavior rather than a substitute
for flow and exception assertions.

## In scope

- Vitest V8 coverage instrumentation and reproducible npm scripts.
- Global and critical-module thresholds.
- Inclusion of unimported source through an all-files scan.
- Coverage reports suitable for local diagnosis and CI review.
- Test isolation conventions for timers, browser globals, query clients, fetch,
  document metadata, and local storage.
- A traceability requirement from flow → test ID → automated test.
- Real-browser tests for behavior jsdom cannot validate.

## Out of scope

- Treating generated type declarations or CSS tokens as executable coverage.
- Raising coverage by asserting implementation details without user-visible or
  contract behavior.
- Enabling deferred Blog routes.
- Replacing product specifications with snapshots.
- Requiring third-party pages or desktop mail clients to complete successfully.

## Coverage contract

The future implementation must add `@vitest/coverage-v8` at the version aligned
with Vitest and provide a `test:coverage` script that runs once in CI mode.

Coverage configuration must:

- use the V8 provider;
- include `src/**/*.{ts,tsx}` even when a file is not imported by a test;
- exclude `src/**/*.test.*`, `src/**/*.spec.*`, `src/test/**`,
  `src/vite-env.d.ts`, generated output, declaration-only files, and build tools;
- not exclude `main.tsx`, API adapters, fixtures, inactive article modules, or
  error branches merely to reach the threshold;
- emit `text`, `json-summary`, `html`, and `lcov` reports;
- clean the report directory before a run;
- enforce at least 90% for statements, branches, functions, and lines; and
  fail CI if no tests execute.

Critical modules—`shared/api/presentation.ts`, `shared/api/blog.ts`, query hooks,
and route/page components—must individually remain at or above 90% whenever the
coverage provider supports scoped thresholds. If per-file branch instrumentation
creates an infeasible false deficit, the exception must name the file, metric,
uncoverable generated branch, and expiry date; global thresholds still apply.

Coverage percentages are rounded by the provider only. CI must use the raw
threshold comparison and may not round 89.5% up to 90% in a wrapper script.

## Test architecture

- **Pure/unit tests:** API validation, URL construction, query options/retry
  predicates, content renderer branches, and deterministic helpers.
- **Component tests:** page and shared-component state matrices with Testing
  Library queries centered on roles, names, text, and semantic attributes.
- **Integration tests:** actual Router, QueryClient, hooks, cache, retry, abort,
  and metadata side effects with only network boundaries mocked.
- **End-to-end tests:** a real browser for history, CSS layout, focus, storage
  persistence, reduced motion, and accessibility.
- **Contract/security tests:** malformed API data, public-only content, unsafe
  protocols, feature flags, and development-fixture isolation.

Snapshots may supplement semantic assertions for stable serialized contracts,
but cannot be the only evidence for an application flow.

## Isolation and fixture rules

- Create a fresh QueryClient per test with retry and garbage collection behavior
  explicitly configured.
- Restore mocks, real timers, fetch, document title, canonical elements,
  document classes/data attributes/CSS properties, storage, scroll position, and
  route state after every test.
- Tests that assert retries must use controlled timers and count network calls.
- Use builders with valid defaults for Presentation, summaries, articles, and
  blocks; override only fields relevant to the scenario.
- Maintain separate valid, minimal, optional-empty, malformed, and unsafe
  fixtures. Do not reuse production prototype fixtures as the only source.
- Avoid timing sleeps. Await user-visible states or controlled promises.
- Test aborted requests distinctly from ordinary network rejection.
- No test may depend on execution order or a cache created by another test.

## Acceptance scenarios

### COV-001 — Enforce all four global thresholds (P0, Active)

- Given the complete executable source set is instrumented
- When `npm run test:coverage` completes
- Then statements, branches, functions, and lines are each at least 90%
- And the command fails if any one metric is below its threshold

### COV-002 — Count unimported source (P0, Active)

- Given an executable source file has no test import
- When coverage runs
- Then that file appears with zero coverage rather than disappearing

### COV-003 — Produce diagnostic artifacts (P1, Active)

- Given coverage succeeds or fails after tests run
- When reports are written
- Then console summary, JSON summary, browsable HTML, and LCOV artifacts exist
- And generated artifacts remain uncommitted

### COV-004 — Prove CI enforcement (P0, Active)

- Given a controlled coverage fixture is below one threshold
- When the CI-equivalent command runs
- Then it exits nonzero
- And the normal repository suite exits zero at or above the thresholds

### COV-005 — Bootstrap the application (P1, Active)

- Given a DOM root exists
- When `main.tsx` executes with the rendering boundary mocked
- Then it creates the root and supplies StrictMode, QueryClientProvider,
  ThemeProvider, BrowserRouter, and App in the expected provider hierarchy
- And the production QueryClient defaults to one query retry

### COV-006 — Characterize a missing root (P2, Active)

- Given `#root` is absent
- When bootstrap executes
- Then the current failure is captured by a characterization test
- And any later friendly bootstrap error requires an approved behavior change

### COV-007 — Preserve test isolation (P0, Active)

- Given one test mutates timers, theme, canonical metadata, scroll progress,
  storage, fetch, or query cache
- When the next test starts
- Then none of those mutations leak into it

### COV-008 — Maintain flow traceability (P1, Active)

- Given a test file is added for this initiative
- When it is reviewed
- Then every behavioral test references a specification ID
- And each P0/P1 ID appears in at least one automated test or approved exception

## Test evidence

- Configuration test or CI smoke fixture for threshold failure.
- Coverage summary stored as a CI artifact.
- Test-name/ID audit script or review checklist.
- Bootstrap component test for `main.tsx`.
- Full `npm test`, `npm run test:coverage`, production build, and E2E checks.

## Decisions and open questions

- Decision: 90% applies independently to statements, branches, functions, and
  lines; it is not an average.
- Decision: deferred executable Blog code remains in coverage scope.
- Decision: CSS and visual behavior are quality-gated through browser tests,
  not JavaScript coverage.
- Decision: a covered line without a meaningful outcome assertion is not
  sufficient test evidence.
- Question: choose the E2E runner and browser matrix before this specification is
  approved. Playwright is the recommended default.
- Question: decide whether critical-module thresholds are enforced per file or
  by named path groups after the first baseline report.
