# Front-end test specification set

- Status: Draft
- Owner: Igor
- Last updated: 2026-08-31

This directory turns the [application flow map](../application-flow-map.md) into
implementation-ready test specifications. Together, the specifications define
the work required to reach and continuously enforce at least 90% automated code
coverage while validating active, deferred, and exception flows.

## Specification index

1. [Coverage foundation and governance](coverage-foundation.md)
2. [Shell, routing, theme, and browser state](shell-routing-theme.md)
3. [Presentation business journeys and API](presentation-business.md)
4. [Deferred Articles index and Blog feed](articles-index.md)
5. [Deferred Article reader and content rendering](article-reader.md)
6. [End-to-end, accessibility, responsive, and nonfunctional checks](browser-quality.md)

## Test ID conventions

- `COV-*`: coverage infrastructure and enforcement.
- `SRT-*`: shell, routing, theme, navigation, focus, and scroll.
- `PRE-*`: Presentation API, query, Home, Presentation page, and contact funnel.
- `AIX-*`: deferred article feed, archive, and pagination.
- `ARD-*`: deferred article detail, renderer, SEO, and content safety.
- `BQA-*`: real-browser journeys, accessibility, responsive layout, motion, and
  production safety.

Every implemented test must retain its ID in the test name or an adjacent
comment. A pull request may satisfy one ID with multiple tests, but must not
combine unrelated IDs into one opaque test.

## Source ownership map

Every executable source file has a primary specification owner. Cross-cutting
browser checks supplement rather than replace the owning unit/integration cases.

| Source                                         | Primary test IDs                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `src/app/main.tsx`                             | `COV-005`–`COV-006`                                                 |
| `src/app/App.tsx`                              | `SRT-001`–`SRT-005`, `AIX-050`, `ARD-050`                           |
| `src/features/presentation/usePresentation.ts` | `PRE-009`–`PRE-012`                                                 |
| `src/shared/api/presentation.ts`               | `PRE-001`–`PRE-008`                                                 |
| `src/pages/HomePage.tsx`                       | `PRE-020`–`PRE-027`                                                 |
| `src/pages/PresentationPage.tsx`               | `PRE-030`–`PRE-045`                                                 |
| `src/shared/components/SiteShell.tsx`          | `SRT-004`–`SRT-026`, `PRE-050`–`PRE-054`                            |
| `src/shared/components/ThemeContext.tsx`       | `SRT-030`–`SRT-039`                                                 |
| `src/shared/components/States.tsx`             | `SRT-040`–`SRT-041`                                                 |
| `src/pages/NotFoundPage.tsx`                   | `SRT-002`, `SRT-005`                                                |
| `src/features/articles/useArticles.ts`         | `AIX-010`–`AIX-012`, `ARD-009`–`ARD-010`                            |
| `src/shared/api/blog.ts`                       | `AIX-001`–`AIX-009`, `ARD-001`–`ARD-008`                            |
| `src/shared/prototype/articles.ts`             | `AIX-002`, `ARD-001`–`ARD-002`                                      |
| `src/pages/ArticlesPage.tsx`                   | `AIX-020`–`AIX-045`                                                 |
| `src/shared/components/ArticleRow.tsx`         | `AIX-024`, `AIX-027`–`AIX-030`                                      |
| `src/pages/ArticlePage.tsx`                    | `ARD-020`–`ARD-048`                                                 |
| `src/shared/styles/global.css`                 | `BQA-026`, `BQA-030`–`BQA-043` (browser evidence; not instrumented) |

## Priority and phase

- **P0:** active business behavior, public feature gate, and coverage tooling.
- **P1:** active supporting behavior and deferred component/contract behavior.
- **P2:** nonfunctional, cross-browser, and hardening coverage.
- **Active:** required for the current production route graph.
- **Deferred:** implemented source tested below the router; becomes an active E2E
  requirement only after the Blog contract is approved.

## Completion rule

This test initiative is complete when:

- all P0 and P1 cases are automated or recorded as approved unsupported cases;
- all four executable-code metrics are at least 90%;
- the active business funnel and every handled exception have behavioral tests;
- known unhandled exceptions have characterization tests or an approved hardening
  specification;
- deferred Blog code is tested without making its routes publicly reachable;
- real-browser checks cover behavior that jsdom cannot prove; and
- CI rejects regressions in both coverage and required behavioral checks.
