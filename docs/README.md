# Architecture Decision Records

This directory contains Architecture Decision Records (ADR) for `@bepower/dev`.

ADRs document the key technical decisions made in this project, including context, alternatives considered, and rationale.

## Index

| ADR | Decision | Status |
|-----|----------|--------|
| [001](./001-biome-over-eslint.md) | Biome over ESLint + Prettier | Accepted |
| [002](./002-lefthook-over-husky.md) | Lefthook over Husky + lint-staged | Accepted |
| [003](./003-tsdown-over-tsc.md) | tsdown over tsc for library builds | Accepted |
| [004](./004-copy-over-extends.md) | Copy configs instead of extending | Accepted |
| [005](./005-npm-only.md) | npm as the only package manager | Accepted |
| [006](./006-github-repo-structure.md) | Single `.github` repo for CLI + org defaults | Accepted |

## Format

Each ADR follows this structure:
- **Status**: Proposed / Accepted / Deprecated / Superseded
- **Context**: What is the issue?
- **Decision**: What was decided?
- **Consequences**: What are the trade-offs?
