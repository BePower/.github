# @bepower/dev

[![CI](https://github.com/BePower/.github/actions/workflows/ci.yml/badge.svg)](https://github.com/BePower/.github/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node >= 22](https://img.shields.io/badge/Node-%3E%3D%2022-brightgreen.svg)](https://nodejs.org/)
[![npm: @bepower/dev](https://img.shields.io/badge/npm-%40bepower%2Fdev-cb3837.svg)](https://github.com/BePower/.github/packages)

> 💄 Configurations and tools for developers (VERY opinionated)

This repo serves a dual purpose:
1. **`@bepower/dev`** — CLI tool that bootstraps projects, distributes golden configs, and installs Kiro AI agents
2. **Org-wide defaults** — GitHub community health files (CONTRIBUTING, SECURITY, issue/PR templates) inherited by all BePower repos

## Prerequisites

- **Node.js >= 22**
- **npm** (not pnpm or yarn)
- Access to [GitHub Packages](https://github.com/orgs/BePower/packages) for `@bepower` scope

## Installation

```bash
npm install -g @bepower/dev
```

## Commands

### `dev bootstrap [name]`

Scaffold a new project with standard configuration.

```bash
# Single projects (--template required)
dev bootstrap @bepower/my-lib -t lib              # npm library
dev bootstrap @bepower/my-infra -t cdk            # CDK application
dev bootstrap @bepower/my-service -t nestjs        # NestJS ECS microservice

# Monorepo (shell only, then use `dev add`)
dev bootstrap @bepower/my-project --monorepo
```

What it does:
1. Copies the root template (single or monorepo shell)
2. For single projects: overlays the package template (lib/cdk/nestjs)
3. Applies golden configs (biome, tsconfig, vitest, lefthook, etc.)
4. Merges devDependencies and scripts into `package.json`
5. Copies base GitHub Actions workflows
6. Runs `npm install` and creates initial git commit

### `dev add <path> --template <type>`

Add a package to a monorepo.

```bash
dev add packages/shared -t lib                    # npm library package
dev add packages/infra -t cdk                     # CDK infrastructure
dev add packages/backend -t nestjs                # NestJS microservice
```

What it does:
1. Copies the package template into the specified path
2. Updates root `package.json` workspaces if needed
3. Sets up package.json with correct name, repository, and directory

### `dev setup`

Add golden configs to an existing project.

```bash
cd existing-project
dev setup            # Copy configs (skip existing files)
dev setup --force    # Overwrite existing configs with latest golden versions
```

What it does:
1. Detects monorepo (workspaces) and selects appropriate config variants
2. Copies config files (only if they don't already exist, unless `--force`)
3. Merges devDependencies and scripts into `package.json`
4. Adds base GitHub Actions workflows

### `dev init-kiro`

Install the `bepower-setup` Kiro agent globally for AI-assisted project configuration.

```bash
dev init-kiro
```

## Golden Configs

These files are copied (not extended) to target projects:

| Config | Description |
|--------|-------------|
| `biome.json` | Biome linter + formatter (single quotes, 100 width, import sorting) |
| `tsconfig.json` | Extends `@tsconfig/node22` |
| `vitest.config.ts` | Vitest + v8 coverage (workspace variant for monorepos) |
| `lefthook.yml` | Git hooks (pre-commit pipeline, commit-msg) |
| `commitlint.config.ts` | Conventional commits |
| `tsdown.config.ts` | Build with tsdown (workspace variant for monorepos) |
| `.editorconfig` | Editor settings |
| `.lockfile-lintrc.json` | Lockfile security |
| `.npmpackagejsonlintrc.json` | package.json validation |
| `.npmrc` | GitHub Packages registry for @bepower scope |

## Architecture

```
BePower/.github/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Org-wide issue templates (bug, feature)
│   ├── PULL_REQUEST_TEMPLATE.md # Org-wide PR template
│   └── workflows/               # CI for this repo
├── profile/
│   └── README.md                # GitHub org profile
│
├── cli/                         # CLI source
│   ├── commands/                # bootstrap, setup, add, init-kiro
│   └── utils/                   # Shared utilities (configs, paths, templates)
├── configs/                     # Golden config files (copied to target projects)
├── kiro/                        # Kiro AI templates (agent, prompt, steering, skills)
│   └── steering/                # Single source of truth for steering docs
├── workflows/                   # GitHub Actions templates (distributed by dev setup)
│   ├── base/                    # CI, PR, security, dependabot
│   ├── library/                 # npm publish
│   └── docs/                    # Documentation site
├── templates/                   # Scaffold templates
│   ├── root/                    # Root templates (single, monorepo)
│   └── package/                 # Package templates (lib, cdk, nestjs)
├── docs/                        # Architecture Decision Records
│
├── CONTRIBUTING.md              # Org-wide contribution guidelines
├── SECURITY.md                  # Org-wide security policy
├── CODE_OF_CONDUCT.md           # Org-wide code of conduct
└── README.md                    # This file
```

### How It Works

```
┌──────────────────────────────────────────────────────────────┐
│                      @bepower/dev CLI                        │
├───────────────┬──────────┬──────────────┬────────────────────┤
│   bootstrap   │   add    │    setup     │     init-kiro      │
│               │          │              │                    │
│  root/        │ package/ │  configs/    │  kiro/             │
│  + package/   │ → path   │  + workflows │  → ~/.kiro/        │
│  + configs/   │          │  + pkg.json  │                    │
│  + workflows  │          │              │                    │
│  → new dir    │          │  → existing  │                    │
└───────────────┴──────────┴──────────────┴────────────────────┘
```

## Stack

| Tool | Purpose | Replaces |
|------|---------|----------|
| **Biome** | Linting & formatting | ESLint + Prettier |
| **Lefthook** | Git hooks | Husky + lint-staged |
| **tsdown** | Building | tsc / esbuild / rollup |
| **bonvoy** | Releases | semantic-release / auto |
| **Vitest** | Testing | Jest |
| **commitlint** | Commit validation | — |
| **npm** | Package manager | pnpm / yarn |

## Community Health (Org-wide)

This repo provides default community health files for the entire BePower GitHub organization:

- [Contributing Guide](CONTRIBUTING.md) — How to contribute to any BePower project
- [Security Policy](SECURITY.md) — How to report vulnerabilities
- [Code of Conduct](CODE_OF_CONDUCT.md) — Expected behavior

These files are automatically inherited by all repos in the org that don't have their own.

## Development

```bash
git clone https://github.com/BePower/.github.git
cd .github
npm install
npm run build
npm test
npm run lint
```

## License

MIT
