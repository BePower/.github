# ADR 004: Copy configs instead of extending

**Status**: Accepted

## Context

Shared configurations can be distributed in two ways:
1. **Extends** — target projects reference the shared package (e.g., `"extends": "@bepower/dev/tsconfig"`)
2. **Copy** — config files are copied into the target project

## Decision

Use the **copy** approach. `dev setup` and `dev bootstrap` copy config files directly into the target project.

## Consequences

### Positive
- No runtime dependency on `@bepower/dev` for configs
- Projects are self-contained — configs work even if `@bepower/dev` is removed
- Full visibility — developers see exactly what's configured
- No version coupling — updating `@bepower/dev` doesn't silently change behavior

### Negative
- Config drift — copied files may diverge from the golden source over time
- Manual updates — running `dev setup` again won't overwrite existing files (by design)
- Duplication — same config exists in every project

### Mitigation
- `dev setup` only copies files that don't exist yet (no accidental overwrites)
- Teams can periodically re-run `dev setup` after removing outdated configs
