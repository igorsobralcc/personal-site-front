# Personal Site Frontend

## Project description

Mobile-first portfolio built with React, TypeScript, Vite, React Router, and TanStack Query. It presents a public professional profile from an independently deployable API, with accessible responsive layouts, resilient loading states, reduced-motion support, and guarded CI delivery.

## Purpose and current scope

This repository contains the public web application for Igor's personal site. It turns the Presentation API's composite public read model into two active routes:

- `/` — concise introduction, availability, professional focus, and a path to the full presentation.
- `/presentation` — biography, grouped skills, selected projects, experience, contact details, and social profiles.

Unknown routes render the shared not-found experience. Article components and API boundaries are retained in the source for a later publishing phase, but article navigation and routes remain commented out until the Blog API contract is approved.

## Architecture

The application is a client-rendered, feature-oriented React application:

```text
src/
  app/                  bootstrap, providers, route table, application tests
  features/
    presentation/       Presentation query and cache policy
    articles/           deferred article queries; not publicly routed
  pages/                route-level composition and page states
  shared/
    api/                 typed HTTP boundaries and development fixtures
    components/          shell, state panels, and reusable content components
    prototype/           deferred article fixture content
    styles/              design tokens, responsive rules, and motion policy
  test/                  shared Vitest browser-environment setup
specs/                   permanent feature specifications
scripts/                 repository policy validators
.github/                 CI and dependency automation
```

### Runtime flow

```text
BrowserRouter
  → SiteShell
    → route page
      → feature query hook
        → typed API boundary
          → Presentation API
```

- `main.tsx` owns React, TanStack Query, and router providers.
- `App.tsx` owns the public route table.
- Pages compose user-visible states but do not perform HTTP requests.
- Feature hooks own TanStack Query keys, cancellation, freshness, and retry behavior.
- Shared API modules are the only network boundary.
- The Presentation response stays in TanStack Query's cache; it is not copied into a client-side store.
- The shell reuses the same cached Presentation query for footer contact information.

### Presentation contract

The application consumes one composite public operation:

```http
GET /api/v1/presentation
```

It supplies the profile, skill categories, projects, experiences, and publication order needed for a complete presentation. During local Vite development, `/api/presentation` is proxied to `https://localhost:7211/api/v1/presentation`.

Set `VITE_PRESENTATION_API_URL` when the API is hosted elsewhere. If a development request fails, the current adapter returns representative prototype Presentation data so UI work can continue. Production builds do not use that fallback.

## Business rules

- Only public presentation content may be requested; administrative routes and credentials never belong in the browser bundle.
- Home remains concise and does not duplicate the full portfolio narrative.
- Presentation records render in API-provided order. The client does not infer skill levels or reorder experience and projects.
- Empty optional collections remove their complete section. Optional fields do not leave punctuation or layout gaps.
- A null experience end date is displayed as `Present`.
- External project and social links render only when a published URL exists and use safe new-tab behavior.
- Contact email and location come from Presentation data and are reused by the shell without a duplicate endpoint.
- Article routes and calls remain unavailable to visitors until the separate Blog API contract is approved.
- Unknown and deferred routes expose no private content and resolve to the normal not-found page.

## Accessibility, responsiveness, and motion

- The layout starts at 320 px and expands at content-driven breakpoints.
- The document keeps one header, named primary navigation, main landmark, and footer.
- Route changes update the document title, return the viewport to main content, and focus the destination heading.
- Navigation and primary actions meet a 44 by 44 CSS-pixel target baseline.
- Semantic headings, lists, links, dates, status announcements, and visible focus indicators are used throughout.
- Colors initially follow the operating system preference and can be overridden with the persistent light/dark switch.
- Motion is limited to short context-preserving transitions. `prefers-reduced-motion` removes nonessential animation and smooth scrolling.
- Long labels, identifiers, media, and code cannot create page-level horizontal overflow.

## Production safety

The repository uses the following safeguards:

- TypeScript project builds reject type errors before Vite emits production assets.
- ESLint Flat Config performs type-aware TypeScript, React Hooks, JSX
  accessibility, import-order, promise-safety, and production logging checks.
- Prettier is the sole source-formatting authority and is verified independently
  from ESLint.
- Zod validates unknown API responses and development fixtures before they enter
  TanStack Query's cache; frontend transport types are inferred from those
  schemas.
- Husky and lint-staged format, lint, and run related Vitest tests for staged
  frontend files before a local commit.
- Vitest and Testing Library cover shared routing, navigation disclosure, active-route state, deferred routes, and shell persistence.
- GitHub Actions installs the exact lockfile with `npm ci`, then checks lint,
  formatting, types, tests, and the production build on pull requests and
  `main`.
- Commit subjects are validated against the repository's Conventional Commit policy.
- The commit validator tests its own accepted and rejected examples before inspecting introduced commits.
- `actionlint` is downloaded at a fixed version, verified by SHA-256, and used to validate workflows.
- Third-party GitHub Actions are pinned to complete commit SHAs.
- Gitleaks scans committed history for accidentally published secrets.
- Workflow permissions default to read-only, persisted checkout credentials are disabled, jobs have timeouts, and redundant CI runs are cancelled.
- Dependabot submits weekly grouped updates for npm packages and GitHub Actions.
- API URLs are build-time configuration; production secrets and administrative credentials must never use the `VITE_` prefix.
- Development fixtures are guarded by `import.meta.env.DEV` and cannot activate in a production build.

## Run locally

### Prerequisites

- Node.js 24.x, matching CI.
- npm, supplied with Node.js.
- Optional: .NET 10 SDK, PostgreSQL, and the sibling Presentation API repository for live data.

### Frontend with development fixture data

1. Open a terminal in this repository:

   ```powershell
   cd C:\Users\igors\repos\personal-site\personal-site-front
   ```

2. Install the exact dependency graph:

   ```powershell
   npm ci
   ```

3. Start Vite:

   ```powershell
   npm run dev
   ```

4. Open the local URL printed by Vite, normally `http://localhost:5173`.

Vite attempts to reach the local Presentation API. When it is unavailable, development-only fixture data keeps the public pages usable.

### Frontend with the live Presentation API

1. Configure and start PostgreSQL as described in the sibling `personal-site-presentation-api` repository.

2. From the shared repositories directory, start the API:

   ```powershell
   dotnet run --project .\personal-site-presentation-api\src\PersonalSite.Presentation.Api
   ```

3. In a second terminal, start this frontend with `npm run dev`.

4. If the API does not use the default `https://localhost:7211` address, create an uncommitted `.env.local` file:

   ```dotenv
   VITE_PRESENTATION_API_URL=https://localhost:YOUR_PORT/api/v1/presentation
   ```

5. Restart Vite after changing environment variables.

Only public configuration belongs in `.env.local`. Any variable prefixed with `VITE_` is eligible to be embedded into client assets.

### Quality checks

Run the same application gates used by CI:

```powershell
npm run quality
npm run build
```

Run an individual check while diagnosing a failure:

```powershell
npm run lint
npm run format:check
npm run typecheck
npm test
```

Apply safe lint and formatting fixes explicitly:

```powershell
npm run lint:fix
npm run format
```

The pre-commit hook applies ESLint and Prettier fixes only to staged files and
runs Vitest tests related to staged JavaScript or TypeScript. Review the changed
staged content before retrying a failed commit. Local hooks optimize feedback;
the full, read-only CI checks remain authoritative.

Run tests continuously while developing:

```powershell
npm run test:watch
```

Validate the commit-message policy with Git Bash:

```powershell
& 'C:\Program Files\Git\bin\bash.exe' scripts/validate-commits.sh --self-test
```

## Development workflow

Behavior changes follow the permanent specifications under `specs/` and the process in [CONTRIBUTING.md](CONTRIBUTING.md): specify, approve, prove with tests, implement, verify, reconcile documentation, and commit in small Conventional Commit checkpoints.

## Key trade-offs

- **Client rendering instead of SSR:** simpler independent deployment and iteration, but weaker first-load SEO and no server-rendered fallback.
- **One composite Presentation request instead of resource waterfalls:** consistent and fast page hydration, but larger responses and coarser cache invalidation.
- **TanStack Query instead of a global client store:** less duplicated server state, but it is not intended for complex local workflow state.
- **Global tokenized CSS instead of CSS Modules:** a small runtime and easy shared theming, but selectors require stronger naming discipline.
- **Development fixtures instead of requiring the API:** faster isolated frontend work, but fixtures can drift until contract-generation checks are added.
- **Deferred blog code instead of deleting it:** preserves completed work and integration boundaries, but carries inactive maintenance surface.
- **System-aware theme with a manual override:** respects the initial device preference and visitor choice, but adds persisted client state and a small risk of pre-hydration color mismatch.

## Technology

- React 19 and React DOM
- TypeScript 5.9
- Vite 7
- React Router 7
- TanStack Query 5
- Vitest, jsdom, and Testing Library
- GitHub Actions, Dependabot, Gitleaks, and actionlint
