# ADR 003: tsdown over tsc for library builds

**Status**: Accepted

## Context

TypeScript libraries need to produce distributable JavaScript + type declarations. Options:
- `tsc` — official compiler, slow, no bundling
- `esbuild` — fast, no DTS generation
- `rollup` + plugins — flexible, complex config
- `tsdown` — modern bundler built on Rolldown (Rust-based)

CDK applications are excluded — they use `tsc` because CDK handles Lambda bundling internally via esbuild.

## Decision

Use **tsdown** for building TypeScript libraries. Use **tsc** only for type-checking (`tsc --noEmit`).

## Consequences

### Positive
- Fast builds (Rust-based Rolldown engine)
- ESM + DTS + sourcemaps in one step
- Simple config (`tsdown.config.ts`)
- Workspace mode for monorepos

### Negative
- Newer tool, smaller community
- CDK projects still need tsc (separate build path)

### Configuration
- Output: `.mjs` + `.d.mts` + `.map`
- Format: ESM only
- Entry: `cli/index.ts` (or `src/index.ts` for libraries)
