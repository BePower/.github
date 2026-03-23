# ADR 002: Lefthook over Husky + lint-staged

**Status**: Accepted

## Context

Most BePower repos used Husky for git hooks with lint-staged for running linters on staged files. This required:
- Two packages (`husky` + `lint-staged`)
- Two config files (`.husky/` directory + `.lintstagedrc`)
- Manual hook script management

## Decision

Use **Lefthook** as the single tool for git hooks.

## Consequences

### Positive
- Single tool, single config (`lefthook.yml`)
- Built-in staged file support (`stage_fixed: true`)
- Piped execution (run steps in sequence, fail fast)
- Parallel execution within priority groups
- No shell scripts in `.husky/` directory

### Negative
- Less widely adopted than Husky
- Team needs to learn new config format

### Configuration
- Pre-commit: biome → lockfile → package-lint → sort → build → typecheck → test
- Commit-msg: commitlint validation
- Priority groups ensure correct execution order
