---
name: context-injection
description: "[DEPRECATED] Load relevant steering docs when specific file types are edited."
trigger: fileEdited
fileMatch: "**/*.{ts,tsx,json,yml,yaml,md}"
runtime: ide
deprecated: true
superseded_by: "KiroCrew 0.7 'Skills Discovered by Search' — on-demand skill_search / steering lookup replaces the cabled file-pattern → steering-doc map."
---

# Context Injection — DEPRECATED

> **DEPRECATED (kept for review, not auto-removed).**
> This hook hardwires a `file pattern → steering doc` injection map. Under
> KiroCrew 0.7 "Skills Discovered by Search", the agent looks up the relevant
> steering/skill **on demand** (`skill_search`) instead of relying on a cabled
> table, which also drifts from reality over time. Recommendation: archive.
> `runtime: ide` because it was event-driven (IDE `fileEdited`) in the first place.

---

## Original behavior (for reference)

When a file is edited, load the relevant steering doc(s) to ensure consistency:

| File pattern | Load steering |
|---|---|
| `test/**/*.test.ts`, `*.spec.ts` | `testing.md` |
| `src/**/*.ts` | `code-style.md` + `architecture.md` |
| `lib/**/*.ts`, `bin/**/*.ts` | `architecture.md` + `code-style.md` |
| `biome.json`, `lefthook.yml`, `tsdown.config.ts`, `tsconfig.json`, `cdk.json` | `build-tooling.md` |
| `CHANGELOG.md`, `.github/**` | `commit-conventions.md` |
| `.kiro/specs/**` | `spec-workflow.md` |
