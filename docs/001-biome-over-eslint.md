# ADR 001: Biome over ESLint + Prettier

**Status**: Accepted

## Context

BePower projects historically used ESLint for linting and Prettier for formatting. This required:
- Two separate tools with overlapping concerns
- Multiple config files (`.eslintrc`, `.prettierrc`, or their equivalents)
- Plugin ecosystem management (`eslint-config-prettier`, `eslint-plugin-*`)
- Slow execution on large codebases

## Decision

Use **Biome** as the single tool for both linting and formatting.

## Consequences

### Positive
- Single tool, single config (`biome.json`)
- Significantly faster (written in Rust)
- Built-in import sorting (no `eslint-plugin-import` needed)
- Consistent formatting + linting in one pass

### Negative
- Smaller plugin ecosystem than ESLint
- Some ESLint rules don't have Biome equivalents yet
- Team needs to learn new tool

### Configuration
- Single quotes, 100 line width
- Uses `.editorconfig` for indent settings
- Import sorting with grouped blank lines (node → packages → aliases → relative)
