# Personal Site Frontend

Public, mobile-first React application for the personal site. The MVP presents
profile, experience, skills, and project data supplied by the Presentation API.
The blog is intentionally outside the MVP boundary.

## Product goals

- Load quickly on mobile and desktop, including on slower networks.
- Use motion to clarify hierarchy and interaction, without delaying content.
- Meet WCAG 2.2 AA expectations and respect `prefers-reduced-motion`.
- Make presentation content deployable independently from the UI.
- Demonstrate frontend craft without sacrificing usability.

## Architecture

The frontend uses a feature-oriented React architecture:

```text
src/
  app/             application bootstrap, providers, routing
  pages/           route-level composition
  features/        presentation, experience, projects, skills
  shared/
    api/            generated API contracts and HTTP client
    components/     reusable accessible UI primitives
    hooks/          cross-feature React hooks
    styles/         tokens, global styles, motion primitives
    utils/          framework-independent helpers
```

Rules:

1. Pages compose features; they do not contain data-access logic.
2. Features may import from `shared`, never from another feature's internals.
3. Server state is fetched through the generated Presentation API client.
4. Animation is progressive enhancement. The content remains complete without
   JavaScript-driven motion.
5. Design tokens define color, type, spacing, radii, shadows, and motion. This
   keeps responsive behavior consistent instead of relying on one-off values.

## Development method

Every feature and behavior change uses spec-driven development. Implementation
cannot begin until its specification defines scope, user-visible behavior,
responsive and accessibility expectations, API dependencies, and verifiable
acceptance scenarios. Development is committed incrementally using Conventional
Commits so each coherent change can be reverted safely. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Planned stack

- React with TypeScript and Vite
- React Router for the current presentation route and the future blog routes
- TanStack Query for remote state, caching, and request lifecycle
- A client generated from the Presentation API OpenAPI document
- Motion for React plus CSS transitions for intentional animation
- CSS Modules backed by design tokens (no runtime CSS-in-JS)
- Vitest and Testing Library for component tests
- Playwright for the critical responsive and accessibility journeys

## Communication with the API

The public application makes one initial request:

```http
GET /api/v1/presentation
```

That endpoint returns the complete public read model, avoiding a waterfall of
profile, experience, project, and skill requests. The frontend treats this
response as server state and does not duplicate it in a global client store.

The API owns its OpenAPI contract. The generated client is the integration
boundary; feature components do not call `fetch` directly. Public requests are
cacheable. Administrative credentials must never be shipped in this frontend.

See the Presentation API repository for the complete contract and error format.

## Responsive and motion baseline

- Start from a 320 px layout and enhance at content-driven breakpoints.
- Use fluid type and spacing with `clamp()` within bounded design tokens.
- Keep primary controls at least 44 by 44 CSS pixels.
- Use semantic HTML, visible focus, keyboard navigation, and sufficient contrast.
- Animate `transform` and `opacity` when possible; avoid layout-heavy animation.
- Reserve media dimensions to prevent layout shift.
- Disable nonessential parallax and reveal effects for reduced-motion users.
- Target Core Web Vitals: LCP below 2.5 s, INP below 200 ms, CLS below 0.1.

## MVP route

`/` is a composed portfolio page with:

1. Hero and profile summary
2. Skills and capabilities
3. Experience timeline
4. Featured projects
5. Contact and social links

The future `/blog` and `/blog/:slug` routes will consume the separate Blog API.

## Delivery order

1. Scaffold the React application and quality gates.
2. Generate the API client from the agreed contract.
3. Implement the design system and responsive shell.
4. Build each portfolio feature using realistic seed data from the API.
5. Add motion, responsive, accessibility, and performance verification.
6. Deploy only after the Presentation API environment is available.
