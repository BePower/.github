# ADR 005: npm as the only package manager

**Status**: Accepted

## Context

BePower repos have used different package managers:
- Most repos: **npm**
- One repo (beppe): **pnpm**
- No repos use yarn

Multiple package managers cause:
- Inconsistent lockfile formats
- Different workspace behaviors
- CI complexity (detect and install correct manager)
- Confusion for developers switching between repos

## Decision

Standardize on **npm** as the only package manager for all BePower projects.

## Consequences

### Positive
- Consistent tooling across all repos
- Single lockfile format (`package-lock.json`)
- Simpler CI/CD (no package manager detection)
- Native workspace support (since npm 7)

### Negative
- npm workspaces are less feature-rich than pnpm workspaces
- No content-addressable storage (pnpm advantage)
- `beppe` repo needs migration from pnpm

### Mitigation
- `beppe` migration is deferred — it will be migrated when next major changes are needed
- `.npmrc` is included in golden configs to ensure consistent registry settings
