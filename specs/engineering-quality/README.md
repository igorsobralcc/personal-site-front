# Engineering quality specifications

This specification set defines the frontend's code-compliance baseline in three
independently deliverable parts:

1. [Static analysis and formatting](static-analysis-and-formatting.md) defines
   TypeScript, ESLint Flat Config, accessibility, hooks, imports, and Prettier.
2. [Runtime contract validation](runtime-contract-validation.md) defines Zod
   schemas, inferred types, API-boundary parsing, and valid UI state models.
3. [Local and CI quality gates](local-and-ci-quality-gates.md) defines npm
   commands, Husky, lint-staged, and required GitHub Actions checks.

The specifications are ordered by dependency. Runtime validation assumes the
static rules are available, and automation invokes both earlier layers. Each
document can move from `Draft` to `Approved` and `Implemented` independently.
