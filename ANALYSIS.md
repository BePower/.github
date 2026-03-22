# @bepower/dev — Analysis & Migration Plan

## Goal

Replicate `@zweer/dev` (personal repo at `../../mine/dev`) into `@bepower/dev` (this repo), adapting it for BePower's corporate needs based on existing company repos under `../`.

---

## Phase 1 — COMPLETED ✅

Core CLI + golden configs ported from `@zweer/dev` and adapted for BePower.

### What was done

- **Removed**: `.husky/`, `.lintstagedrc`, `biome/common.json`, old CLI (`cli/program.ts`, `cli/types.ts`), old test
- **Created CLI**: `cli/index.ts` with 3 commands (`bootstrap`, `setup`, `init-kiro`)
- **Created golden configs** (`configs/`): `_biome.json`, `editorconfig`, `commitlint.config.ts`, `lefthook.yml`, `lockfile-lintrc.json`, `npmpackagejsonlintrc.json`, `tsconfig.json`, `tsdown.config.ts`, `vitest.config.ts`, `npmrc`
- **Created templates**: `single/` and `monorepo/` (adapted for BePower: author, scope, GitHub Packages registry)
- **Created workflows**: `base/` (ci, pr, security, dependabot, dependabot-lockfile, dependabot-auto-merge), `library/npm.yml`, `docs/docs.yml`
- **Created kiro agent**: `bepower-setup` with steering, skills, prompt, agent config
- **Updated root**: package.json (new deps, scripts, bin, files, engines >= 22, publishConfig), biome.json, tsconfig.json, tsdown.config.ts, vitest.config.ts, lefthook.yml, commitlint.config.ts, .gitignore, .npmrc, .kiro/, README.md

### Decisions made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Husky vs Lefthook | **Lefthook** | Simpler config, built-in staging, no lint-staged needed |
| pnpm support | **npm only** | beppe is the only outlier, standardize |
| Node version | **>= 22** | For new projects; old ones migrate gradually |
| Build (libraries) | **tsdown** | ESM + DTS + sourcemaps |
| Build (CDK apps) | **tsc** | CDK uses esbuild for Lambda bundling internally |
| Releases | **bonvoy** | Replaces `auto` used in bep-cdk |
| Agent name | **bepower-setup** | — |
| Config distribution | **Copy** (not extends) | Same as personal |
| Registry | **GitHub Packages** | `@bepower:registry=https://npm.pkg.github.com` |
| npmpackagejsonlint author | **BePower** | `valid-values-author: ["BePower"]` |

### Verified

- `npm install` ✅ (lefthook hooks installed automatically)
- `npm run build` ✅ (tsdown → dist/index.mjs + .d.mts + .map)
- `tsc --noEmit` ✅
- `npm test` ✅ (2 tests from template scaffolds pass)

---

## Source: @zweer/dev (personal)

### Structure
```
@zweer/dev/
├── cli/                    # CLI tool (commander)
│   ├── index.ts            # Entry point, 3 commands
│   ├── commands/
│   │   ├── bootstrap.ts    # Scaffold new project from template
│   │   ├── setup.ts        # Add golden configs to existing project
│   │   └── init-kiro.ts    # Install zweer-setup agent globally
│   └── utils/
│       ├── configs.ts      # Copy config files, workflows
│       ├── paths.ts        # Resolve package root paths
│       └── templates.ts    # Copy template with variable substitution
├── configs/                # Golden config files (copied to target projects)
│   ├── _biome.json         # Biome linter+formatter config
│   ├── tsconfig.json       # Extends @tsconfig/node22
│   ├── tsdown.config.ts    # Build with tsdown
│   ├── vitest.config.ts    # Vitest + v8 coverage
│   ├── lefthook.yml        # Git hooks (pre-commit pipeline, commit-msg)
│   ├── commitlint.config.ts
│   ├── editorconfig
│   ├── lockfile-lintrc.json
│   └── npmpackagejsonlintrc.json
├── kiro/                   # Kiro templates (distributed via npm)
│   ├── agents/zweer-setup.json
│   ├── prompts/zweer-setup.md
│   ├── steering/           # 5 steering files
│   └── skills/             # 4 skill templates with references
├── workflows/              # GitHub Actions templates
│   ├── base/               # ci, pr, security, dependabot (3 files)
│   ├── library/npm.yml
│   └── docs/docs.yml
├── templates/              # Scaffold templates
│   ├── single/             # Single npm package
│   └── monorepo/           # npm workspaces with packages/*
└── .kiro/                  # Kiro config for developing @zweer/dev itself
```

### Stack Decisions (personal)
- **Biome** (not ESLint/Prettier) — single quotes, 100 line width, import sorting
- **Lefthook** (not husky+lint-staged) — piped pre-commit, commit-msg
- **tsdown** (not tsc for build) — ESM + DTS + sourcemaps
- **bonvoy** (not semantic-release) — releases
- **commitlint** — conventional commits
- **npm** — package manager
- **@tsconfig/node22** — TypeScript base
- **Copy** config distribution (not extends)

---

## Target: BePower Company Repos (under ../)

### Repo Inventory

| Repo | Type | Package Manager | Linter | Formatter | Test | Build | Hooks | Status |
|------|------|----------------|--------|-----------|------|-------|-------|--------|
| **aldo** | Monorepo (AI/Slack bot + CDK) | npm | Biome | Biome | Vitest | tsc | husky+lint-staged | Modern ✅ |
| **dev-configs** | Library (code-style) | npm | — | — | Vitest | — | husky+lint-staged | Minimal |
| **bep-cdk** | Monorepo (CDK lib) | npm | ESLint | Prettier | Jest | tsc | — | Legacy |
| **main-utils** | CDK app (+ workspaces) | npm | ESLint | Prettier | Jest | — | — | Legacy |
| **beppe** | Monorepo (CDK app) | **pnpm** | ESLint | Prettier | Vitest | tsc | — | Mixed |
| **becky/becky-misc** | CDK app | npm | ESLint | Prettier | Jest | — | — | Legacy |
| **becky/becky-common** | CDK lib | npm | ESLint | Prettier | Jest | tsc | — | Legacy |
| **becky/becky-ocpp-universal-fe-apig** | CDK app | npm | ESLint | Prettier | Jest | — | — | Legacy |
| **becky/ocpp-universal-fe** | Node app (Docker) | npm | — | — | Jest | — | — | Legacy |
| **session** | ECS microservice (NestJS) | npm | tslint | Prettier | Jest (e2e) | tsc | — | Legacy |
| **becky-ocpi** | ECS microservice (NestJS) | npm | tslint | — | Jest (e2e) | tsc | — | Legacy |
| **becharge-app-mobile** | Mobile app | ? | ? | ? | ? | ? | ? | Unknown |

### Key Observations

1. **aldo is the most modern repo** — already uses Biome, Vitest, husky, concurrently, npm-package-json-lint, @tsconfig/node22, @vitest/coverage-v8. Closest to @zweer/dev approach. Also has CDK for AWS deployment.

2. **beppe is the outlier** — uses pnpm, ESLint, Prettier, Vitest (old v1.1.3), very complex scripts. Node 20.10.0 pinned. Won't be migrated soon.

3. **Most CDK repos** use the old stack: ESLint + Prettier + Jest + tsc. They depend on `@bepower/bep-cdk` and `@bepower/bep-cdk-lib`.

4. **dev-configs** (`@bepower/code-style`) is the existing config package but it's nearly empty — just package.json, vitest, editorconfig, husky. No actual shared configs exported yet. **Superseded by this repo.**

5. **Common patterns across BePower repos**:
   - `.npmrc` with `@bepower:registry=https://npm.pkg.github.com` (GitHub Packages)
   - `.editorconfig` identical to personal
   - Author: "BePower", License: MIT or ISC
   - GitHub org: `BePower`
   - Many repos have `.vscode/settings.json`

6. **aldo already has .kiro/** with agents, specs, prompts, settings — manually created

7. **No repo uses**: lefthook, commitlint, tsdown, bonvoy, lockfile-lint, sort-package-json, ls-engines

8. **session and becky-ocpi are NestJS ECS microservices** — identical architecture pattern. Both use NestJS 8, TypeORM 0.2.x, node-config-ts, Redis message broker, SQS task queues, CDK Pipeline with ECS Blue/Green deploy. Both use CommonJS (not ESM), tslint (deprecated), Jest for e2e, Node 18 in Docker. This is a well-established pattern at BePower for backend microservices.

9. **ECS microservices have CDK as a separate npm workspace** — `cdk/` has its own `package.json`, `tsconfig.json`, and dependencies. This is different from `cdk-app` where CDK is the main project.

10. **codedeploy-config/** is specific to ECS Blue/Green — contains `appspec.yaml` + `taskdef.json` per environment (test/prod). Not present in Lambda-based CDK apps.

### Deep Dive: CDK App Pattern (becky-misc, becky-common, becky-ocpp-universal-fe-apig, main-utils)

Common structure across all CDK apps:
```
cdk-app/
├── bin/                    # CDK app entry point (e.g. bin/app.ts)
├── lib/                    # CDK stacks and constructs
│   ├── stacks/             # Stack definitions (sometimes flat in lib/)
│   └── stages/             # Pipeline stages (optional)
├── src/                    # Lambda/application source code
│   └── handlers/           # Lambda handlers (esbuild-bundled by CDK)
├── test/                   # Jest tests (stacks + stages)
├── cdk.json                # CDK config (app entry, context)
├── cdk.context.json        # CDK context values
├── tsconfig.json           # Custom (NOT @tsconfig/node22, has outDir, rootDir)
├── jest.config.ts          # Jest config
├── .npmrc                  # GitHub Packages registry
├── .editorconfig           # Standard
├── .prettierrc             # `"singleQuote": true` (to be replaced by biome)
├── .eslintrc / eslint.config.js  # (to be replaced by biome)
└── .gitignore
```

Key differences from library template:
- **No tsdown** — CDK uses `tsc` for type-checking, esbuild for Lambda bundling (handled by CDK internally via `NodejsFunction`)
- **No npm publish** — CDK apps are deployed, not published
- **`cdk.json`** is essential — defines app entry point, context, feature flags
- **Dependencies**: `aws-cdk-lib`, `constructs`, `@bepower/bep-cdk`, `@bepower/bep-cdk-lib`, `esbuild`
- **DevDependencies**: `aws-cdk` (CLI), `@types/node`, `typescript`
- **Scripts**: `cdk synth`, `cdk deploy`, `cdk diff` (via `npx cdk` or `aws-cdk` devDep)
- **tsconfig.json**: needs `outDir`, `rootDir`, `declaration: true` — different from library tsconfig

### Deep Dive: CDK Lib Pattern (bep-cdk)

```
cdk-lib/
├── packages/
│   ├── bep-cdk/            # Core CDK constructs
│   └── bep-cdk-lib/        # Higher-level CDK patterns
├── jest.config.ts           # Root Jest config
├── auto.config.ts           # `auto` release config (to be replaced by bonvoy)
├── .npmrc                   # GitHub Packages
├── .nvmrc                   # Node version pin
└── tsconfig.build.json      # Build-specific tsconfig
```

Key differences:
- **Monorepo** with npm workspaces
- **Publishes** to GitHub Packages (like library, but CDK-specific)
- **Uses `auto`** for releases (to be replaced by bonvoy)
- **Uses lerna + nx** for monorepo orchestration (to be replaced by npm workspaces + tsdown workspace mode)
- **Jest** (to be replaced by Vitest)

### Deep Dive: ECS Microservice Pattern (session, becky-ocpi)

Common structure across NestJS ECS microservices:
```
ecs-microservice/
├── src/                        # NestJS application
│   ├── main.ts                 # Bootstrap (NestFactory + microservice transports)
│   ├── app.module.ts           # Root module (TypeORM, feature modules)
│   ├── health.controller.ts    # Health check endpoint (/health)
│   ├── common/                 # Shared: config service, middlewares, utils, entities
│   ├── message-broker/         # Redis message broker module
│   ├── tracer-module/          # OpenTelemetry tracing
│   └── <domain>/              # Feature modules (NestJS modular pattern)
│       ├── <domain>.module.ts
│       ├── <domain>.service.ts
│       ├── controllers/
│       ├── repositories/       # TypeORM repositories
│       ├── entities/           # TypeORM entities
│       └── dtos/
├── e2e/                        # E2E tests (Jest, supertest, real DB)
│   ├── setup.ts / teardown.ts
│   └── utils/
├── config/                     # node-config-ts runtime config
│   ├── default.json            # Config with @@PLACEHOLDER for env vars
│   └── env/                    # Per-environment overrides
├── migrations/                 # SQL migration files (manual)
├── cdk/                        # CDK infra (separate npm workspace)
│   ├── bin/<name>.ts           # CDK app entry
│   ├── lib/stacks/             # Pipeline + App stack
│   ├── lib/stages/             # CDK Stage
│   ├── lib/const(ants).ts
│   ├── package.json            # CDK deps (separate from app)
│   └── tsconfig.json           # CDK-specific tsconfig
├── codedeploy-config/          # ECS Blue/Green deploy
│   ├── test/  (appspec.yaml + taskdef.json)
│   └── prod/  (appspec.yaml + taskdef.json)
├── Dockerfile                  # Multi-stage: node:18 build → node:18-alpine
├── docker-compose.yml          # Local dev (postgres + redis + jaeger)
├── .env.example
├── nest-cli.json
├── nodemon.json                # Dev server (ts-node + tsconfig-paths + dotenv)
├── webpack.config.js           # HMR (legacy, likely unused)
├── tsconfig.json               # CommonJS, decorators, outDir: ./dist, baseUrl: ./src
├── tsconfig.build.json         # Extends base, exclude tests
├── tsconfig.spec.json          # Extends base, e2e only
├── cdk.json                    # CDK app entry + context flags
├── cdk.context.json
├── package.json                # workspaces: ["cdk", "lambda?"]
├── .npmrc                      # GitHub Packages
├── .editorconfig
└── .gitignore
```

Key differences from CDK app (Lambda) pattern:
- **NestJS** framework — modules, controllers, services, decorators, DI
- **Dockerfile** — multi-stage build (node:18 → node:18-alpine), deployed as Docker container
- **docker-compose.yml** — local dev with postgres + redis + jaeger
- **ECS Fargate** — not Lambda. Blue/Green deploy via CodeDeploy
- **TypeORM 0.2.x** + PostgreSQL (Aurora via `BeckyDatabaseStack.createDatabase()`)
- **Redis** — message broker (`@bepower/redis-message-broker`) + mutex + caching
- **SQS** — async task processing (`@bepower/task-lib`)
- **node-config-ts** — runtime config with `@@PLACEHOLDER` env var substitution
- **OpenTelemetry** — tracing via `@bepower/nestjs-common` (Jaeger/Dynatrace)
- **CommonJS** module system (NestJS + decorators + TypeORM requirement)
- **CDK as separate workspace** — `cdk/package.json` with its own deps and tsconfig
- **codedeploy-config/** — `appspec.yaml` + `taskdef.json` per environment
- **SQL migrations** — manual `.sql` files (not ORM-generated)
- **e2e tests** — Jest with real DB, supertest, build-then-run pattern (`tsc → jest on dist/`)
- **NestJS 8** (both repos — outdated, current is 10+)
- **Node 18** in Dockerfile (to be upgraded to 22)

Shared BePower dependencies:
- `@bepower/nestjs-common` — Logger, OpenTelemetry instrument, utilities
- `@bepower/redis-message-broker` — Inter-service pub/sub via Redis Streams
- `@bepower/task-lib` — SQS-based task queue with transport
- `@bepower/becky-cdk` — Shared CDK constructs (BeckyDatabaseStack, BeckyEcsStack)
- `@bepower/bep-cdk` / `@bepower/bep-cdk-lib` — CDK base (Account, PipelineStack, Stage)
- `@bepower/becky-pricing-models` — Shared pricing types

CDK pipeline pattern (identical in both):
1. `PipelineStack` extends `@bepower/bep-cdk-lib/PipelineStack`
2. `CodePipeline` with `CodePipelineSource.connection()` (GitHub)
3. Two waves: dev/staging (noprod) or preprod/prod (prod)
4. `ManualApprovalStep` for promotion to non-dev stages
5. `Stage` contains the `AppStack`
6. `AppStack` creates: Aurora DB + proxy, ECS Fargate service, SQS queues, Redis connections

Differences between the two repos:
| Aspect | session | becky-ocpi |
|--------|---------|------------|
| Port | 3001 | 8181 |
| Global prefix | none | `/ocpi` |
| Middlewares | minimal | rate-limiter, CORS, interop, logger |
| Lambda sidecar | no | yes (`lambda/asyncpush/`) |
| Route53 | no | yes (custom domain) |
| Complexity | simpler | more complex (OCPI protocol) |
| Prettier config | `.prettierrc` file | none (uses tslint — deprecated) |
| docker-compose | no | yes (postgres + redis + jaeger) |
| Workspaces | `["cdk"]` | `["cdk", "lambda"]` |

### Deep Dive: App Pattern (aldo)

```
aldo/
├── packages/
│   ├── aws/                # CDK stacks + Lambda handlers
│   ├── cli/                # CLI tool for local operations
│   └── common/             # Shared types and utilities
├── data/                   # Local data (docs, entities)
├── docs/                   # Architecture, development guides
├── .kiro/                  # Manually created Kiro config
├── flowrag.config.json     # FlowRAG pipeline config
├── vitest.config.ts        # Root Vitest config
└── .lintstagedrc           # lint-staged config (to be replaced by lefthook)
```

Key differences from pure library monorepo:
- **Not published** to npm — it's an application
- **Has CDK** in `packages/aws/` for deployment
- **Has CLI** in `packages/cli/` for local operations
- **Uses `tsc`** for build (not tsdown) — outputs `.js` + `.d.ts` alongside source
- **Has `.env`** files for configuration
- **Has `data/`** directory for local data storage

---

## Phase 2: Templates — COMPLETED ✅

### Templates to create

#### `cdk-app` — CDK Application (HIGH PRIORITY)

Covers: becky-misc, becky-common, becky-ocpp-universal-fe-apig, main-utils

```
templates/cdk-app/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   └── app-stack.ts        # Example stack
├── src/
│   └── handlers/
│       └── hello.ts        # Example Lambda handler
├── test/
│   └── app-stack.test.ts   # Example stack test
├── cdk.json                # CDK config with standard context/feature flags
├── package.json            # aws-cdk-lib, constructs, @bepower/bep-cdk, esbuild
├── tsconfig.json           # CDK-specific (outDir, rootDir)
├── README.md
└── CHANGELOG.md
```

Differences from `single` template:
- No tsdown (build with `tsc`, Lambda bundling by CDK)
- No npm publish (deploy, not publish)
- CDK-specific scripts: `cdk synth`, `cdk deploy`, `cdk diff`
- CDK-specific deps: `aws-cdk-lib`, `constructs`, `esbuild`, `aws-cdk`
- CDK-specific tsconfig (outDir, rootDir, declaration)
- `cdk.json` with BePower standard context and feature flags

#### `cdk-lib` — CDK Library (MEDIUM PRIORITY)

Covers: bep-cdk

```
templates/cdk-lib/
├── packages/
│   └── core/
│       ├── src/
│       │   └── index.ts
│       ├── test/
│       │   └── index.test.ts
│       ├── package.json    # aws-cdk-lib as peerDep
│       └── README.md
├── package.json            # Workspaces, bonvoy, no tsdown
├── tsconfig.json           # CDK-specific
├── vitest.config.ts        # Monorepo coverage
├── README.md
└── CHANGELOG.md
```

Differences from `monorepo` template:
- No tsdown (build with `tsc`)
- `aws-cdk-lib` and `constructs` as peerDependencies in packages
- CDK-specific tsconfig
- Publishes to GitHub Packages

#### `ecs-microservice` — NestJS ECS Microservice (HIGH PRIORITY)

Covers: session, becky-ocpi, and future NestJS microservices

```
templates/ecs-microservice/
├── src/
│   ├── main.ts                 # NestJS bootstrap + microservice transports
│   ├── app.module.ts           # Root module (TypeORM, CommonModule, feature modules)
│   ├── health.controller.ts    # Health check endpoint
│   ├── common/
│   │   ├── common.module.ts
│   │   └── configuration.service.ts  # node-config-ts wrapper
│   ├── message-broker/
│   │   └── message-broker.module.ts  # Redis pub/sub
│   └── tracer-module/
│       └── tracer.module.ts    # OpenTelemetry setup
├── e2e/
│   ├── setup.ts
│   ├── teardown.ts
│   └── utils/
├── config/
│   ├── default.json            # Runtime config with @@PLACEHOLDER env vars
│   └── env/
│       ├── development.json
│       ├── staging.json
│       ├── preprod.json
│       └── prod.json
├── migrations/
│   └── init-app.sql            # Initial DB schema
├── cdk/
│   ├── bin/app.ts              # CDK app entry (PipelineStack per branch)
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── stacks/
│   │   │   ├── pipeline-stack.ts   # CodePipeline + waves + ManualApproval
│   │   │   └── app-stack.ts        # ECS Fargate + Aurora + Redis + SQS
│   │   └── stages/
│   │       └── app-stage.ts
│   ├── package.json            # CDK deps (separate workspace)
│   └── tsconfig.json           # CDK-specific tsconfig
├── codedeploy-config/
│   ├── test/
│   │   ├── appspec.yaml        # ECS Blue/Green deploy spec
│   │   └── taskdef.json        # ECS task definition
│   └── prod/
│       ├── appspec.yaml
│       └── taskdef.json
├── Dockerfile                  # Multi-stage: node:22 build → node:22-alpine
├── docker-compose.yml          # Local dev (postgres + redis + jaeger)
├── .dockerignore
├── .env.example
├── nest-cli.json
├── nodemon.json                # Dev server (ts-node + tsconfig-paths + dotenv)
├── package.json                # NestJS deps, workspaces: ["cdk"]
├── tsconfig.json               # CommonJS, decorators, outDir, baseUrl: ./src
├── tsconfig.build.json         # Extends base, exclude tests
├── tsconfig.spec.json          # Extends base, e2e only
├── cdk.json                    # CDK app entry + BePower context flags
├── README.md
└── CHANGELOG.md
```

Differences from `cdk-app` (Lambda) template:
- **NestJS** framework (not plain Lambda handlers)
- **Dockerfile** + multi-stage build (not esbuild bundled by CDK)
- **docker-compose.yml** for local dev (postgres + redis + jaeger)
- **ECS Fargate** deployment (not Lambda)
- **Blue/Green deploy** via CodeDeploy (`codedeploy-config/`)
- **TypeORM** + PostgreSQL (Aurora via `BeckyDatabaseStack`)
- **Redis message broker** (`@bepower/redis-message-broker`) for inter-service pub/sub
- **node-config-ts** for runtime config (`config/default.json` with `@@PLACEHOLDER`)
- **OpenTelemetry** tracing (Jaeger/Dynatrace)
- **CommonJS** module system (NestJS + decorators requirement)
- **nest-cli.json** + **nodemon.json** for dev workflow
- **CDK workspace** separate (`cdk/package.json` with its own deps)
- **SQL migrations** directory (manual, not ORM-generated)
- **e2e tests** with Jest (DB-backed, supertest) — to be migrated to Vitest
- **SQS queues** for async task processing (`@bepower/task-lib`)

Key dependencies:
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/typeorm` — NestJS
- `typeorm`, `pg` — Database
- `@bepower/nestjs-common` — Logger, OpenTelemetry, utilities
- `@bepower/redis-message-broker` — Inter-service messaging
- `@bepower/task-lib` — SQS task queue
- `@bepower/becky-cdk` — Shared CDK constructs (BeckyDatabaseStack, BeckyEcsStack)
- `@bepower/bep-cdk`, `@bepower/bep-cdk-lib` — CDK base (Account, PipelineStack)
- `node-config-ts` — Runtime configuration
- `reflect-metadata`, `class-transformer`, `class-validator` — NestJS decorators/validation

#### NOT creating separate templates for:

- **App** (like aldo) — too specific. Use `monorepo` + `dev setup` + manual customization.
- **Docker app** (like ocpp-universal-fe) — too niche. Use `single` + Dockerfile manually.
- **Mobile app** (becharge-app-mobile) — completely different ecosystem, out of scope.

### Workflows to add (Phase 4)

- `workflows/cdk/deploy.yml` — CDK synth + deploy pipeline
- `workflows/cdk/diff.yml` — CDK diff on PR (optional)
- `workflows/ecs/deploy.yml` — ECS Blue/Green deploy pipeline (optional, mostly handled by CDK Pipeline)

---

## File Mapping: Personal → Corporate (UPDATED)

| Personal (@zweer/dev) | Corporate (@bepower/dev) | Status |
|----------------------|------------------------|--------|
| `configs/_biome.json` | `configs/_biome.json` | ✅ Done |
| `configs/tsconfig.json` | `configs/tsconfig.json` | ✅ Done |
| `configs/vitest.config.ts` | `configs/vitest.config.ts` | ✅ Done |
| `configs/lefthook.yml` | `configs/lefthook.yml` | ✅ Done |
| `configs/commitlint.config.ts` | `configs/commitlint.config.ts` | ✅ Done |
| `configs/editorconfig` | `configs/editorconfig` | ✅ Done |
| `configs/lockfile-lintrc.json` | `configs/lockfile-lintrc.json` | ✅ Done |
| `configs/npmpackagejsonlintrc.json` | `configs/npmpackagejsonlintrc.json` | ✅ Done (author: BePower) |
| `configs/tsdown.config.ts` | `configs/tsdown.config.ts` | ✅ Done |
| — | `configs/npmrc` | ✅ Done (GitHub Packages) |
| `kiro/agents/zweer-setup.json` | `kiro/agents/bepower-setup.json` | ✅ Done |
| `kiro/prompts/zweer-setup.md` | `kiro/prompts/bepower-setup.md` | ✅ Done |
| `kiro/steering/*` | `kiro/steering/*` | ✅ Done |
| `kiro/skills/*` | `kiro/skills/*` | ✅ Done |
| `templates/single/` | `templates/single/` | ✅ Done |
| `templates/monorepo/` | `templates/monorepo/` | ✅ Done |
| — | `templates/cdk-app/` | ✅ Done |
| — | `templates/cdk-lib/` | ✅ Done |
| — | `templates/ecs-microservice/` | ✅ Done |
| `workflows/base/*` | `workflows/base/*` | ✅ Done |
| `workflows/library/npm.yml` | `workflows/library/npm.yml` | ✅ Done (GitHub Packages) |
| `workflows/docs/docs.yml` | `workflows/docs/docs.yml` | ✅ Done |
| — | `workflows/cdk/deploy.yml` | 🔲 Phase 4 |
| — | `workflows/ecs/deploy.yml` | 🔲 Phase 4 |
