# Engineering capability: Local and CI quality gates

- Status: Implemented
- Owner: Igor
- Last updated: 2026-08-31

## Outcome

Fast local checks stop common defects before a commit, while reproducible CI
checks prevent unformatted, untyped, unlinted, or failing frontend code from
merging. Local hooks optimize feedback but never replace the authoritative
remote gate.

## In scope

- Stable npm commands for linting, formatting, type-checking, testing, and the
  aggregate quality gate.
- Husky-managed pre-commit setup committed to the repository.
- lint-staged checks limited to staged paths.
- Related Vitest execution for staged source and test files.
- GitHub Actions barriers for pull requests and `main`.
- Documentation of bypass, failure recovery, and required branch protection.

## Out of scope

- Server-repository hooks or organization-wide GitHub settings.
- Running the complete browser/end-to-end matrix on every local commit.
- Automatically changing commit messages or silently committing formatter
  output.
- Treating client-side hooks as a security boundary.

## Command contract

`package.json` exposes commands with these responsibilities:

| Command                           | Responsibility                                            | May write files |
| --------------------------------- | --------------------------------------------------------- | --------------- |
| `npm run lint`                    | ESLint all governed repository files with zero errors     | No              |
| `npm run lint:fix`                | Apply safe ESLint fixes                                   | Yes             |
| `npm run format`                  | Apply Prettier to the governed file set                   | Yes             |
| `npm run format:check`            | Verify Prettier output                                    | No              |
| `npm run typecheck`               | TypeScript project-reference check with no emitted JS     | No              |
| `npm test`                        | Complete Vitest suite once                                | No              |
| `npm run test:related -- <paths>` | Vitest tests related to supplied staged source/test paths | No              |
| `npm run quality`                 | Lint, formatting check, type-check, and complete tests    | No              |

Commands must work on Windows developer machines and Ubuntu GitHub-hosted
runners. Put shell-independent orchestration in npm scripts or a small Node
script rather than Bash-only package commands.

## Pre-commit behavior

Install Husky and lint-staged as development dependencies and commit the hook
bootstrap required by the selected Husky version. The pre-commit hook invokes
lint-staged and nothing that scans unrelated working-tree files.

lint-staged applies the following policy to the staged snapshot:

- `*.{js,jsx,ts,tsx}`: ESLint safe fixes, Prettier write, and related Vitest
  execution when tests can relate to the supplied paths.
- Supported non-code text such as `*.{json,md,yml,yaml,css,html}`: Prettier
  write.
- Files changed by fixers are re-staged by lint-staged's normal behavior.

The implementation must use Vitest because it is the repository's established
test runner; Jest is not introduced. If Vitest cannot identify a related test,
that is not itself a failure. An identified related test failure is blocking.
Type-checking is not limited reliably by staged file boundaries and therefore
runs in CI and through `npm run quality`, not once per lint-staged filename.

Partially staged files must retain unstaged edits after the hook. The hook must
not run `git add .`, rewrite unrelated files, or hide modifications. A failed
hook prints the failing command and leaves the developer able to inspect and
retry. Emergency bypass with Git's `--no-verify` remains technically possible
but is exceptional and cannot bypass CI.

## CI behavior

Extend the existing `CI` workflow for pull requests targeting `main`, pushes to
`main`, and manual dispatch. Preserve the current locked install, pinned action
SHAs, read-only permissions, disabled persisted credentials, concurrency
cancellation, timeouts, commit policy, actionlint validation, and secret scan.

After `npm ci`, the application quality job must run distinct, visibly named
steps for:

1. `npm run lint`
2. `npm run format:check`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

The separate type-check step is intentional even though build also checks
types: it gives a stable, explicit branch-protection signal and catches future
build-script changes. No CI step auto-fixes or commits files. `npm ci` must fail
when `package.json` and `package-lock.json` disagree.

The workflow may use one sequential quality job for clear feedback and minimal
setup cost, or split read-only checks into parallel jobs if measured CI duration
justifies repeated installation. Either shape must make every named gate
required before merge. Repository branch protection is configured to require
the resulting checks; the workflow alone cannot guarantee this setting.

## Installation and contributor experience

The standard `npm install`/`npm ci` lifecycle initializes Husky for a Git
checkout without failing package installation in archive or CI environments
where `.git` is unavailable. Update `CONTRIBUTING.md` and the README quality
section with:

- the local fast path (`npm run quality`),
- individual diagnostic commands,
- what pre-commit changes and tests,
- how to inspect and re-stage fixes,
- the fact that CI is authoritative.

Do not require a global ESLint, Prettier, Husky, lint-staged, TypeScript, or
Vitest installation. All commands resolve the locked local dependencies.

## Acceptance scenarios

### Scenario: Format and lint staged TypeScript

- Given a contributor stages a TypeScript file with fixable import order and
  formatting differences
- When they commit
- Then lint-staged applies ESLint and Prettier to that file
- And the corrected staged content is what the commit records
- And unrelated files are not reformatted

### Scenario: Stop an unsafe staged change

- Given staged TypeScript violates a non-fixable required ESLint rule
- When the contributor commits
- Then the pre-commit hook exits nonzero
- And no commit is created
- And staged and unstaged work remains recoverable

### Scenario: Run related tests only

- Given a staged source change has related Vitest tests
- When the pre-commit hook runs
- Then those related tests run once for the staged batch
- And an unrelated full test suite is not required by the hook

### Scenario: Validate a pull request

- Given a pull request targets `main`
- When GitHub Actions runs
- Then locked installation, lint, format check, type-check, complete tests, and
  production build each execute as visible checks
- And any nonzero command blocks the quality job

### Scenario: Reject formatting drift in CI

- Given a contributor bypasses the hook and pushes code that differs from
  Prettier output
- When CI runs
- Then `format:check` fails without modifying the branch

### Scenario: Preserve existing supply-chain guardrails

- Given the quality workflow is updated
- When the workflow policy is inspected and actionlint runs
- Then action SHAs remain fully pinned, permissions remain read-only,
  credentials remain unpersisted, timeouts remain bounded, and secret and
  commit-policy jobs remain enabled

### Scenario: Install outside a Git checkout

- Given dependencies are installed from a source archive or CI environment
  without usable Git hook metadata
- When the package lifecycle runs
- Then dependency installation succeeds
- And the absence of a local hook does not weaken the CI gate

## Test evidence

Implementation evidence recorded on 2026-08-31:

- Husky initialized `.husky/_` as the repository hook path and the committed
  pre-commit entry invokes lint-staged.
- `npm run test:related -- src/shared/api/contract.ts` runs and passes both
  related test files; `npm run test:related -- eslint.config.js` finds no tests
  and exits successfully.
- The cross-platform prepare script exits successfully from a directory without
  Git metadata.
- `npm run quality` constituents pass locally: lint, formatting, type-check, and
  the complete 12-test Vitest suite.
- `npm run build` succeeds after the quality checks.

- lint-staged dry-run or disposable-repository tests for staged TypeScript,
  formatting-only text, partial staging, no-related-test, and failing-test cases.
- Husky hook smoke test showing a rejected commit and a successful retry.
- `npm run quality` and `npm run build` pass from a clean locked install.
- GitHub Actions run links showing every named gate on a pull request.
- actionlint success and review evidence that existing workflow hardening remains
  intact.
- Branch-protection screenshot or repository-setting record showing the quality
  check is required before merge.

## Decisions and open questions

- Decision: Vitest related-test execution replaces the generic Jest suggestion
  because Vitest is already the project's test runner.
- Decision: pre-commit is staged and fast; CI is full-repository and
  authoritative.
- Decision: type-check runs explicitly in CI even when the production build
  also invokes TypeScript.
- Decision: hooks may fix staged files, but CI is strictly read-only.
- Decision: retain one sequential frontend-quality job to avoid repeated locked
  dependency installation; split it only if future CI timing warrants the cost.
- Question: branch-protection changes require repository-administrator action
  outside this source tree and must be recorded as implementation evidence.
