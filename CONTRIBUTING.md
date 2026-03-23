# Contributing to BePower

Thank you for contributing to BePower projects! This guide applies to all repositories in the BePower organization.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a feature branch from `main`

## Development Workflow

### Branch Naming

```
feat/short-description
fix/short-description
chore/short-description
docs/short-description
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) with [gitmoji](https://gitmoji.dev/) text codes:

```
type(scope): :emoji_code: short description

Detailed explanation of what changed and why.
```

Examples:
```
feat(api): :sparkles: add user authentication endpoint

Implemented JWT-based authentication with refresh tokens.
Uses bcrypt for password hashing.

fix(cli): :bug: handle missing package.json gracefully

The setup command now exits with a clear error message
instead of throwing an unhandled exception.
```

Types: `feat`, `fix`, `perf`, `docs`, `chore`, `refactor`, `test`, `style`, `ci`, `build`

### Pull Requests

1. Keep PRs focused — one concern per PR
2. Fill in the PR template
3. Ensure CI passes (lint, build, test)
4. Request review from at least one team member
5. Squash merge into `main`

## Code Standards

### TypeScript

- Strict mode, no `any`
- ES modules with `.js` extensions in imports
- Explicit types on exported functions
- `camelCase` for code, `kebab-case` for files, `PascalCase` for types

### Tooling

| Tool | Purpose |
|------|---------|
| **Biome** | Linting & formatting |
| **Lefthook** | Git hooks (pre-commit, commit-msg) |
| **Vitest** | Testing |
| **tsdown** | Building (libraries) |
| **commitlint** | Commit message validation |

### Common Commands

```bash
npm run build          # Build
npm run lint           # Run all linters
npm run lint:format    # Biome check + fix
npm run lint:typecheck # TypeScript type-check
npm test               # Run tests
npm run test:coverage  # Tests with coverage
```

## Reporting Issues

Use the [issue templates](https://github.com/BePower/.github/issues/new/choose) to report bugs or request features. Include:

- Clear description of the problem or request
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details (Node version, OS)

## Questions?

Open a discussion or reach out to the team on Slack.
