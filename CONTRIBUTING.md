# Contributing

## Required method: spec-driven development

Every feature, bug fix that changes behavior, and breaking refactor starts with
a version-controlled specification under `specs/<feature-name>/spec.md`.
Implementation follows the accepted specification; the implementation is not
the source of the intended behavior.

### Workflow

1. **Specify** — copy `specs/_template/spec.md`, describe the outcome and mark
   the specification `Draft`.
2. **Review** — resolve open questions and mark it `Approved` before production
   implementation begins.
3. **Contract** — update expected API types, routes, UI states, accessibility,
   responsive behavior, and motion behavior in the specification.
4. **Prove** — add tests that map directly to the acceptance scenarios and
   initially fail for the missing behavior.
5. **Implement** — write the smallest feature that satisfies the specification.
6. **Verify** — run unit, component, integration, end-to-end, accessibility,
   responsive, and build checks that apply to the feature.
7. **Reconcile** — update the specification when an approved decision changes;
   never silently make implementation and specification disagree.
8. **Complete** — mark the specification `Implemented` and record its test
   evidence.

### Frontend specification requirements

A frontend feature specification must cover:

- Loading, success, empty, partial-data, and error states
- Keyboard, focus, semantic HTML, labels, and contrast expectations
- Mobile-first behavior and any content-driven breakpoints
- Motion purpose, timing constraints, and reduced-motion behavior
- Presentation API contract dependencies
- Performance risks such as large media, rendering, or additional requests
- Analytics or telemetry only when explicitly required

Direct `fetch` calls in components are not acceptable. If the server contract
changes, the Presentation API OpenAPI specification changes first, then the
generated client and frontend specification are updated.

### Pull request gate

A feature is incomplete unless its pull request links its specification,
acceptance scenarios map to automated tests, relevant checks pass, and the
documentation describes the behavior that was actually delivered.

### Local quality gate

Before opening or updating a pull request, run:

```powershell
npm run quality
npm run build
```

Husky invokes lint-staged before each commit. Staged JavaScript and TypeScript
receive safe ESLint and Prettier fixes followed by related Vitest tests;
supported staged text files receive Prettier fixes. Inspect the resulting staged
diff and re-stage intentional partial changes before retrying a failed commit.
The hook never replaces the full repository checks in CI.

Use `npm run lint:fix` and `npm run format` for deliberate repository-wide
cleanup. Do not install global copies of the quality tools and do not bypass a
failed hook except for a documented emergency; `--no-verify` cannot bypass CI.

## Required method: Conventional Commits

Development must be recorded as a sequence of small, atomic commits using the
[Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>(<optional-scope>): <imperative summary>
```

Allowed types are `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`,
`chore`, `perf`, `style`, and `revert`. Use `!` and a `BREAKING CHANGE:` footer
for breaking changes.

Examples:

```text
docs(hero): approve responsive behavior spec
test(hero): cover reduced-motion rendering
feat(hero): implement responsive introduction
perf(images): defer noncritical project media
```

Commits must be dispersed throughout development at meaningful, working
checkpoints. Do not wait until the end of a feature and place the entire change
in one commit. A normal sequence is specification, contract or tests,
implementation, and focused refinement.

Each commit must:

- Represent one coherent reason for change
- Avoid unrelated formatting, cleanup, or feature work
- Keep the repository buildable whenever practical
- Include tests with the behavior they prove, or in an immediately preceding
  test commit during the red-green cycle
- Be independently understandable and safely revertible
- Never contain secrets, generated local state, or temporary debugging changes

Use a `revert:` commit to undo shared history. Do not rewrite published history
to conceal intermediate development.
