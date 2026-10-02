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
dev bootstrap @bepower/my-service -t nestjs        # NestJS ECS microservice

# Monorepo (shell only, then use `dev add`)
dev bootstrap @bepower/my-project --monorepo
```

> **CDK projects** use [`@bepower/bep-cdk-cli`](https://github.com/BePower/bep-cdk-cli) which provides an interactive wizard with account selection, pipeline setup, and version sync:
> ```bash
> npx @bepower/bep-cdk-cli init
> ```

What it does:
1. Copies the root template (single or monorepo shell)
2. For single projects: overlays the package template (lib/nestjs)
3. Applies golden configs (biome, tsconfig, vitest, lefthook, etc.)
4. Merges devDependencies and scripts into `package.json`
5. Copies base GitHub Actions workflows
6. Runs `npm install`

### `dev add <path> --template <type>`

Add a package to a monorepo.

```bash
dev add packages/shared -t lib                    # npm library package
dev add packages/backend -t nestjs                # NestJS microservice
```

> For CDK infrastructure packages, use `npx @bepower/bep-cdk-cli init` inside the monorepo.

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

> **Note**: `engines` is only set if the project doesn't already have one. If your project has an older `engines` value (e.g., `>= 18`), update it manually.

### `dev diff`

Show differences between local configs and the golden versions distributed by `@bepower/dev`.

```bash
dev diff             # List configs that differ or are missing
```

Useful for detecting config drift without modifying anything. To apply updates, run `dev setup --force`.

### `dev init-kiro`

Install the BePower Kiro agents globally (into `~/.kiro/`) for AI-assisted work across every project: the four agents, their prompts, workflow skills, hooks and steering docs.

```bash
dev init-kiro
```

At the end it offers an interactive opt-in — **"Also initialize KiroCrew? (y/N)"** — which, if accepted, runs `dev init-crew` for you. The prompt is skipped in non-interactive shells (CI), so the command never blocks a pipeline.

What it installs:
1. `~/.kiro/agents/*.json` — the four agent specs (also valid KiroCrew templates)
2. `~/.kiro/prompts/*.md` — their system prompts
3. `~/.kiro/skills/` — workflow skills (incl. the `upgrade-guardian` skill)
4. `~/.kiro/hooks/` — safety-gate, barrel-export, etc.
5. `~/.kiro/steering/` — shared steering docs

### `dev init-crew`

Register the installed agents as **KiroCrew members** so they appear in the dashboard's agent picker. Run it after `dev init-kiro`, or let the `init-kiro` prompt call it.

```bash
dev init-crew
```

- **Idempotent** — re-running skips members that already exist.
- **Degrades gracefully** — if the `kirocrew` binary is not installed, it prints a note and exits cleanly instead of failing (so IDE-only users are unaffected).

> **Installing from GitHub Packages.** `@bepower/dev` is published to GitHub Packages (not npmjs.org). To install the CLI you need the `@bepower` scope mapped to the GitHub registry and a token with `read:packages`:
> ```bash
> npm config set @bepower:registry https://npm.pkg.github.com
> npm config set //npm.pkg.github.com/:_authToken='${GITHUB_PACKAGES_TOKEN}'
> export GITHUB_PACKAGES_TOKEN="$(gh auth token)"   # reuses your gh login
> npm install -g @bepower/dev
> ```
> Using `${GITHUB_PACKAGES_TOKEN}` keeps the token out of `~/.npmrc` on disk — it is read from the environment at install time.

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
| `.kiro/settings/lsp.json` | Kiro LSP configuration (TypeScript, Python, Go, Rust, Java) |

## Kiro AI Templates

Distributed via `dev init-kiro`, these configure the Kiro AI agent for BePower projects.

### Workflow Skills

Trigger these in chat to switch the agent's cognitive mode:

| Trigger | Mode | Use when |
|---------|------|----------|
| `plan product` | Product Owner | Starting a feature, vague requirements |
| `plan eng` | Tech Lead | Architecture, failure modes, test matrix |
| `code review` | Paranoid Reviewer | After implementation, before committing |
| `qa` | QA Lead | Verify changes, health score |
| `ship prep` | Release Engineer | Build/lint/test checklist + commit message |
| `retro` | Engineering Manager | Analyze what happened (git history) |
| `new spec` | Spec Author | Create structured spec from template |

Typical flow: `plan product` → `plan eng` → implement → `code review` → `qa` → `ship prep`

### Hooks

| Hook | Trigger | What it does |
|------|---------|-------------|
| `safety-gate` | `preToolUse` | Blocks git commit/push, npm publish, destructive ops |
| `barrel-export` | `fileCreated` | Auto-updates barrel index.ts in monorepo packages |
| `context-injection` | `fileEdited` | Loads relevant steering doc based on file type |
| `post-task-summary` | `agentStop` | Summarizes changes + suggests commit message |

### Steering Docs

| Doc | Content |
|-----|---------|
| `code-style.md` | TypeScript conventions, naming, error handling |
| `build-tooling.md` | tsdown, biome, lefthook, npm |
| `testing.md` | Vitest, coverage, mocking |
| `interaction.md` | Agent behavior, workflow skills, no git commit |
| `commit-conventions.md` | Conventional commits + gitmoji |
| `architecture.md` | CDK patterns, NestJS structure, observability (CDK/ECS projects) |

### Global Agents

These agents are distributed by `dev init-kiro` for use across all BePower projects. Each is read-only by default — they analyze and propose, but never commit, push, publish, or open PRs (enforced by `deniedCommands` in the spec and the `safety-gate` hook):

| Agent | Description |
|-------|-------------|
| `bepower-setup` | Analyzes a project and generates optimal `.kiro/` configuration (steering, agent, prompt, skills) |
| `functional-analyst` | Interactive functional analysis — collects requirements through conversation, produces approval docs and technical briefs (Italian-first) |
| `upgrade-guardian` | Assesses the safety of a dependency/framework upgrade in an isolated worktree and returns a reasoned **LOW/MEDIUM/HIGH** risk verdict with real breaking-change analysis, project impact and verification |
| `rev-eng` | Reverse-engineers a target web app's internal API via Playwright and documents it for a TypeScript client |

## Using the Agents

Once installed, the agents live in `~/.kiro/agents/` and can be driven from **two runtimes** that share the same specs.

### In kiro-cli / IDE

Pass the agent name to `kiro-cli chat`:

```bash
# in the repo you want it to work on
cd ~/projects/bepower/bep-cdk
kiro-cli chat --agent upgrade-guardian
```

Then start the conversation by telling it what to assess, e.g.:

> _"Assess the Dependabot branch that bumps `datadog-cdk-constructs-v2` to 5.2.0 — is it safe to merge?"_

The agent reads the project context (`README.md`, `AGENTS.md` if present, `package.json`, steering docs), does its analysis, and reports back. It will not mutate the repo.

### In the KiroCrew dashboard

After `dev init-crew` the agents appear as **members in the dashboard's agent picker**. Open a new chat, pick `upgrade-guardian` (or `rev-eng`), and start the conversation the same way — the result (e.g. an upgrade safety report) is rendered inline, with each member keeping its own dedicated memory.

### How to start the conversation

These agents are **task-driven**, not chatty — open with the concrete thing you want assessed:

| Agent | A good opening message |
|-------|------------------------|
| `upgrade-guardian` | _"Assess upgrading `<package>` from `<x>` to `<y>` in this repo. Is it safe to merge?"_ |
| `rev-eng` | _"Reverse-engineer the API of `<url>` and document the endpoints for a TypeScript client."_ |
| `bepower-setup` | _"Analyze this project and generate the `.kiro/` configuration for it."_ |
| `functional-analyst` | _"Raccogliamo i requisiti per `<feature>`."_ (Italian-first) |

The agent does the rest — reads context, analyzes, and returns a verdict or document. For `upgrade-guardian` the output is a safety report with a LOW/MEDIUM/HIGH verdict and a **suggested** (never executed) commit message; you decide whether to apply it.

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
│   ├── steering/                # Single source of truth for steering docs
│   ├── skills/                  # Workflow skills (plan, review, qa, ship, specs)
│   └── hooks/                   # Agent hooks (safety gate, barrel export, etc.)
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
| **release-please** | Releases | semantic-release / auto |
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
