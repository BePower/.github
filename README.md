# @bepower/dev

> 💄 Configurations and tools for developers (VERY opinionated)

## Installation

```bash
npm install -g @bepower/dev
```

## Commands

### `dev bootstrap [name]`

Scaffold a new project with standard configuration.

```bash
dev bootstrap @bepower/my-lib           # Single package (default)
dev bootstrap @bepower/my-lib -t monorepo  # Monorepo with workspaces
```

### `dev setup`

Add golden configs to an existing project. Copies config files, merges devDependencies and scripts into `package.json`, adds base GitHub Actions workflows.

```bash
cd existing-project
dev setup
```

### `dev init-kiro`

Install the `bepower-setup` Kiro agent globally for AI-assisted project configuration.

```bash
dev init-kiro
```

## Golden Configs

| Config | Description |
|--------|-------------|
| `biome.json` | Biome linter + formatter (single quotes, 100 width, import sorting) |
| `tsconfig.json` | Extends `@tsconfig/node22` |
| `vitest.config.ts` | Vitest + v8 coverage |
| `lefthook.yml` | Git hooks (pre-commit pipeline, commit-msg) |
| `commitlint.config.ts` | Conventional commits |
| `tsdown.config.ts` | Build with tsdown (ESM + DTS + sourcemaps) |
| `.editorconfig` | Editor settings |
| `.lockfile-lintrc.json` | Lockfile security |
| `.npmpackagejsonlintrc.json` | package.json validation |
| `.npmrc` | GitHub Packages registry for @bepower scope |

## Stack

- **Biome** — linting & formatting
- **Lefthook** — git hooks
- **tsdown** — building
- **bonvoy** — releases
- **Vitest** — testing
- **commitlint** — conventional commits
- **npm** — package manager
- **Node >= 22**

## License

MIT
