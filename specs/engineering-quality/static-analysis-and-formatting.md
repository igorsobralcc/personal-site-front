# Engineering capability: Static analysis and formatting

- Status: Implemented
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Contributors receive fast, deterministic feedback for TypeScript correctness,
React hook misuse, accessibility defects, unsafe promises, import structure,
debug logging, and formatting. ESLint owns correctness and maintainability;
Prettier alone owns source layout.

## In scope

- ESLint 9 Flat Config in `eslint.config.js` using `@eslint/js` and
  `typescript-eslint`.
- Type-aware linting for TypeScript source, tests, and Vite configuration.
- React Hooks and JSX accessibility rules.
- TypeScript safety rules, ordered imports, and production console protection.
- Prettier configuration and ignore policy.
- Strict TypeScript options for every executable project configuration.
- Documented `lint`, `lint:fix`, `format`, `format:check`, and `typecheck` npm
  commands.

## Out of scope

- Runtime validation of network data; that belongs to the runtime contract
  validation specification.
- Git hooks and CI workflow changes; those belong to the automation
  specification.
- Stylelint, CSS architecture changes, generated-client adoption, or a broad
  refactor unrelated to satisfying the new baseline.
- Enforcing subjective code metrics such as line count or cyclomatic complexity
  in the first release.

## Toolchain contract

Install direct development dependencies for the configuration that imports
them: `eslint`, `@eslint/js`, `typescript-eslint`,
`eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`,
`eslint-plugin-import`, `eslint-import-resolver-typescript`, `prettier`, and
`eslint-config-prettier`. Commit `package.json` and `package-lock.json` together.

Use the repository's native ECMAScript module format. `eslint.config.js` exports
one `tseslint.config(...)` composition and does not introduce a legacy
`.eslintrc*` file. The configuration must:

- Ignore generated or external content including `dist`, `coverage`,
  `node_modules`, and `*.tsbuildinfo`.
- Start with `@eslint/js` recommended rules.
- Apply `typescript-eslint`'s `recommendedTypeChecked` configurations to
  `**/*.{ts,tsx}`.
- Resolve project types with `parserOptions.projectService: true` and an
  explicit `tsconfigRootDir`, so editors and the CLI inspect the same projects.
- Provide browser globals to application files and Node globals to
  `vite.config.ts` and repository scripts.
- Apply React Hooks rules and the recommended `jsx-a11y` rule set to JSX/TSX.
- Apply `eslint-config-prettier` last so ESLint does not compete with Prettier.

JavaScript configuration files that are not part of a TypeScript project must
receive syntax linting without type-aware TypeScript rules. Every linted
TypeScript file must be included by `tsconfig.app.json`, `tsconfig.node.json`,
or a purpose-built lint project; files must not silently fall back to untyped
linting.

## Required rule policy

The following rules are release-blocking errors unless stated otherwise:

| Concern                  | Rule                                               | Policy                                                                                                          |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hook placement           | `react-hooks/rules-of-hooks`                       | Error                                                                                                           |
| Hook dependencies        | `react-hooks/exhaustive-deps`                      | Warning initially; no pre-existing warning may be ignored without a documented reason                           |
| Unsafe escape hatch      | `@typescript-eslint/no-explicit-any`               | Error; use a concrete type or `unknown` plus narrowing                                                          |
| Public function contract | `@typescript-eslint/explicit-function-return-type` | Error for named/exported functions, components, and hooks; typed and anonymous callbacks may infer their return |
| Rejected promise         | `@typescript-eslint/no-floating-promises`          | Error; await, return, aggregate, or intentionally mark with `void`                                              |
| Import structure         | `import/order`                                     | Error; groups separated by one blank line and alphabetized case-insensitively                                   |
| Duplicate imports        | `import/no-duplicates`                             | Error                                                                                                           |
| Debug output             | `no-console`                                       | Error in production application code                                                                            |

Import order is: Node built-ins, external packages, internal aliases when they
exist, parent/sibling/index modules, object imports, and type imports. CSS and
other side-effect imports appear after value imports and retain intentional
relative order. ESLint may auto-fix ordering; reviewers must not need to sort it
manually.

Tests and tooling may use console output only where output is the behavior under
test or the script's documented interface. Such exemptions live in a narrow
Flat Config override, not inline disables spread through application source.
Inline disable comments require a reason after `--` and must cover the smallest
possible line range.

The initial migration may keep `react-hooks/exhaustive-deps` as a warning to
make stale-closure risks visible without encouraging unsafe mechanical changes.
The implementation record must list every remaining warning. A follow-up may
promote it to an error only after the warning count reaches zero.

## TypeScript compilation policy

Both `tsconfig.app.json` and `tsconfig.node.json` must explicitly or through a
shared base enable:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

The solution-style root `tsconfig.json` retains project references. The
`typecheck` command must build those references (for example, `tsc -b`) so both
browser and Vite configuration code are checked. It must not emit JavaScript.
Production `build` continues to type-check before Vite emits assets.

Non-null assertions, unchecked casts, and `@ts-ignore` are not substitutes for
fixing newly exposed errors. Use runtime narrowing, a typed invariant helper, or
`@ts-expect-error` with a reason and a test when an external type defect makes an
exception unavoidable.

## Formatting policy

Prettier formats supported source and repository text. The committed baseline
uses the project's existing conventions: single quotes, no semicolons, trailing
commas where valid, and a consistent print width selected during implementation.
`.prettierignore` excludes generated output, dependencies, coverage, build-info
files, and lockfiles that should not be rewritten by hand.

ESLint contains no indentation, quote, semicolon, line-length, or other layout
rules. `npm run format` writes changes; `npm run format:check` is read-only and
returns nonzero when committed files differ from Prettier output.

## Migration behavior

Adoption is atomic: the configuration, dependency lock, scripts, and all fixes
needed for a clean baseline land together. Auto-fixes must be reviewed, and
format-only churn must not conceal behavior changes. Existing direct API casts,
which require runtime design work, are handled by the runtime validation spec
rather than disabled globally.

## Acceptance scenarios

### Scenario: Detect a floating promise

- Given a TypeScript source file starts an async operation without awaiting,
  returning, aggregating, or intentionally voiding it
- When `npm run lint` runs
- Then lint exits nonzero with `@typescript-eslint/no-floating-promises`

### Scenario: Detect a hook dependency risk

- Given an effect reads a reactive value omitted from its dependency list
- When `npm run lint` runs
- Then the omission is reported by `react-hooks/exhaustive-deps`

### Scenario: Detect inaccessible JSX

- Given JSX introduces an interactive pattern without the required semantic or
  keyboard behavior covered by `jsx-a11y`
- When `npm run lint` runs
- Then lint exits nonzero with the relevant accessibility rule

### Scenario: Reject unsafe TypeScript shortcuts

- Given application code introduces explicit `any`, an undocumented return
  contract on a named exported function, or an unused local
- When lint and type-check commands run
- Then at least one command exits nonzero and identifies the source location

### Scenario: Keep formatting separate

- Given valid code is formatted differently from the committed Prettier policy
- When `npm run lint` runs
- Then no layout-only ESLint failure is produced
- And when `npm run format:check` runs, it exits nonzero

### Scenario: Protect production logging

- Given production application code calls `console.log`
- When `npm run lint` runs
- Then lint exits nonzero

### Scenario: Validate the clean repository

- Given dependencies are installed from the lockfile
- When `npm run lint`, `npm run typecheck`, `npm run format:check`, tests, and
  the production build run
- Then every command exits zero without unhandled ESLint warnings

## Test evidence

Implementation evidence recorded on 2026-08-31:

- `npm run lint` passes with zero errors and zero warnings.
- `npm run typecheck` passes for the application and Vite project references.
- `npm run format:check` passes for the complete governed repository.
- `npm test` passes 12 tests across 2 test files.
- `npm run build` produces the production application successfully.

- Configuration smoke tests or temporary fixtures proving each required rule
  reports the expected violation.
- A clean full-repository lint result with the warning count recorded.
- Successful TypeScript project-reference check for app and Vite code.
- Successful Prettier check after formatting the adopted file set.
- Existing Vitest suite and production build remain green after migration.

## Decisions and open questions

- Decision: use ESLint Flat Config only; do not add compatibility wrappers for
  `.eslintrc` packages.
- Decision: Prettier is the only formatting authority.
- Decision: type-aware linting covers tests as well as production TypeScript.
- Decision: explicit return types apply to public/named boundaries while
  anonymous callbacks may remain inferred.
- Decision: `react-hooks/exhaustive-deps` starts as a warning and is promoted in
  a separately reviewed zero-warning change.
- Decision: Prettier uses a 100-column print width.
