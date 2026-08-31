# Feature specifications

Create one directory per independently deliverable behavior:

```text
specs/
  portfolio-shell/
    spec.md
  experience-timeline/
    spec.md
```

Use `_template/spec.md`. Specifications are permanent product documentation,
not temporary planning notes, and evolve through `Draft`, `Approved`, and
`Implemented` states.

Cross-cutting engineering capabilities may use a small indexed specification
set when their parts are independently deliverable. See
[`engineering-quality/`](engineering-quality/) for the frontend's static
analysis, runtime validation, and automated quality-gate specifications.
