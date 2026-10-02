# Changelog







## [3.1.0](https://github.com/BePower/.github/compare/dev-3.0.0...dev-3.1.0) (2026-10-02)


### Features

* **cli:** add dev init-crew command and KiroCrew opt-in in init-kiro ([#18](https://github.com/BePower/.github/issues/18)) ([90d4185](https://github.com/BePower/.github/commit/90d41853fe4e5020683b1488b36f2537c7ad75d1))

## [3.0.0](https://github.com/BePower/.github/compare/dev-2.0.0...dev-3.0.0) (2026-10-02)


### ⚠ BREAKING CHANGES

* **cli:** `dev bootstrap` no longer runs `git init` and creates an initial commit. Initialize the repo manually after bootstrapping.

### Features

* **cli:** :sparkles: improve config management and add diff command ([07cec2d](https://github.com/BePower/.github/commit/07cec2da8cbf57a896e48c6b43a9b7670d4fe15f))
* **kiro:** :sparkles: add upgrade-guardian and generic rev-eng agents ([e3e92ad](https://github.com/BePower/.github/commit/e3e92ad17a4738e0b33cf87b35e3a15965bdfc45))
* **kiro:** :sparkles: enhance templates from production project ([dd34f64](https://github.com/BePower/.github/commit/dd34f64492902cc4b900ac6ae285186ac2073690))
* **kiro:** :sparkles: install functional-analyst globally and add ([89619ae](https://github.com/BePower/.github/commit/89619aec33d8fb25e74a5d004560f3b1ba236704))
* **kiro:** add upgrade-guardian and generic rev-eng agents ([80999e7](https://github.com/BePower/.github/commit/80999e74027c79740bd21dd273d83ef9bad29996))
* **skills:** :sparkles: add testlist.md to spec-templates workflow ([9df3a2f](https://github.com/BePower/.github/commit/9df3a2fc6f581d38cdeef0590c006a8ab5150223))


### Bug Fixes

* **cli:** :adhesive_bandage: handle init-kiro copy failures gracefully ([5542cec](https://github.com/BePower/.github/commit/5542cecac28916d622683ab0953c1487e06c6b0d))
* **kiro:** :lock: broaden upgrade-guardian npm-save deny pattern ([c71886b](https://github.com/BePower/.github/commit/c71886bb342ed70d4ef7f4d4214912115a288abd))


### Performance Improvements

* **deps:** bump commander & @commander-js/extra-typings to 15.0.0 ([#6](https://github.com/BePower/.github/issues/6)) ([67e8f49](https://github.com/BePower/.github/commit/67e8f49f3d8ddfef7ee4c2b9807c2d33b15939ab))
* **deps:** bump sort-package-json from 3.6.1 to 4.0.0 ([#15](https://github.com/BePower/.github/issues/15)) ([4add251](https://github.com/BePower/.github/commit/4add251717adea9c40674fc7157b3a5fd030914d))

## [2.0.0](https://github.com/BePower/.github/compare/dev-1.4.0...dev-2.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* **cli:** `dev bootstrap -t cdk` and `dev add -t cdk` no longer scaffold CDK projects. Use `npx @bepower/bep-cdk-cli init` instead.
* **cli:** `dev bootstrap -t cdk` and `dev add -t cdk` no longer scaffold CDK projects. Use `npx @bepower/bep-cdk-cli init` instead for full CDK scaffolding with pipeline and account wizard.
* **cli:** bootstrap no longer accepts -t single/monorepo/cdk-app/ cdk-lib/ecs-microservice. Use --template lib/cdk/nestjs for single projects, or --monorepo for monorepo shell.
* **cli:** npx @bepower/dev now registers as dev command. Config files removed from templates — they are now always sourced from configs/ directory.

### Features

* :tada: Started the project with few stuff ([dee89ad](https://github.com/BePower/.github/commit/dee89ad4e30bfed40c08375afd022c78e9185362))
* **cli:** :boom: remove cdk template, add version sync and dependabot ([e30d8b4](https://github.com/BePower/.github/commit/e30d8b493792e4abc3687f9fecc20c4b2cc2e73a))
* **cli:** :boom: remove cdk template, replace bonvoy with ([ce505d2](https://github.com/BePower/.github/commit/ce505d2e382d3f7e8be79945361b5d567a9c6a9a))
* **cli:** :sparkles: add --force flag to dev setup command ([dbf88b8](https://github.com/BePower/.github/commit/dbf88b85912f538e9afae21aa813d7e33b9d91ad))
* **cli:** :sparkles: composable scaffolding with bootstrap + add ([278e2d9](https://github.com/BePower/.github/commit/278e2d94f4d2dd81a8998b02ec117991aa7e63cb))
* **configs:** :wrench: distribute sync-biome-schema workflow to golden ([d70f05a](https://github.com/BePower/.github/commit/d70f05a37bccdac5b2d72a9d16a787ea9b040ed9))
* **kiro:** :sparkles: add architecture steering, CDK/ECS prompt templates, and new-stack skill ([c31bd7f](https://github.com/BePower/.github/commit/c31bd7f7c379c9cc3cbe0f716d178ceb35729f61))
* **kiro:** :sparkles: add functional-analyst agent ([aadf093](https://github.com/BePower/.github/commit/aadf093b10d0cc04621e559d037d1bd4e1d03e3b))
* **kiro:** :sparkles: add workflow skills, hooks, and spec templates ([2651279](https://github.com/BePower/.github/commit/26512793fbab0bc09ca1bff32c50a654776c9cee))
* **templates:** :sparkles: add cdk-app, ecs-microservice, and cdk-lib templates ([2586324](https://github.com/BePower/.github/commit/2586324b8cc70d966c7665daf22b636cad8ed7c8))


### Bug Fixes

* :bug: Fixed tests ([39c519d](https://github.com/BePower/.github/commit/39c519d91c935aaad9e40b9c1b649c537e323d88))
* :bug: skip lefthook install in CI ([4198f47](https://github.com/BePower/.github/commit/4198f47d740b988d949da1f0a1c73a7b20916b42))
* :bug: skip lefthook install in CI environments ([a4356e1](https://github.com/BePower/.github/commit/a4356e1394ddbd8a390bf308ed4c49f1e8ede74a))
* **ci:** :bug: add workflow_call trigger to CI workflow ([e598244](https://github.com/BePower/.github/commit/e5982443ba610431e4b5779017351aea6923f2f7))
* **cli:** :bug: fix asset path resolution for installed package ([b087abf](https://github.com/BePower/.github/commit/b087abfc0ce6aebf4e8ac1442f751394c6c62de9))
* **configs:** :wrench: sanitize commit messages before commitlint validation ([323bb2f](https://github.com/BePower/.github/commit/323bb2f6a804f635b13e6be2bf9014daa64b5c32))


### Code Refactoring

* **cli:** :recycle: deduplicate configs and fix bin name ([4e9e3e6](https://github.com/BePower/.github/commit/4e9e3e678f50768b706d328867ad4aa31f0ff6ec))

## [1.3.1] - 2026-05-16

### ✨ Features

- feat(kiro): :sparkles: add functional-analyst agent

## [1.3.0] - 2026-04-10

### 🐛 Bug Fixes

- fix(configs): :wrench: sanitize commit messages before commitlint validation

### 📚 Documentation

- docs: :memo: document workflow skills, hooks, and steering in README
- docs(kiro): :memo: document workflow skills in interaction steering

## [1.2.2] - 2026-04-10

### ✨ Features

- feat(kiro): :sparkles: add workflow skills, hooks, and spec templates

## [1.2.1] - 2026-04-03

### 🐛 Bug Fixes

- fix: :bug: skip lefthook install in CI environments
- fix: :bug: skip lefthook install in CI

### 📚 Documentation

- docs(kiro): :wrench: document CodeBuild Node.js runtime override best practice
- docs(kiro): :memo: remove NestedStack, add Route53MainStack best practices

### ### chore

- chore: Update allowed-hosts in lockfile-lintrc.json
- chore: Add allowed-urls to lockfile-lintrc.json

## [1.2.0] - 2026-03-26

### 🐛 Bug Fixes

- fix(cli): :bug: fix asset path resolution for installed package

### ### ci

- ci: :bug: fix bonvoy github plugin config

## [1.1.0] - 2026-03-25

### ✨ Features

- feat(cli): :sparkles: composable scaffolding with bootstrap + add

### ### refactor

- refactor(cli): :recycle: deduplicate configs and fix bin name

### ### ci

- ci: :bug: use TypeScript config for bonvoy

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-23

### ✨ Features

- feat(cli): :sparkles: add --force flag to dev setup command
- feat(kiro): :sparkles: add architecture steering, CDK/ECS prompt templates, and new-stack skill
- feat(templates): :sparkles: add cdk-app, ecs-microservice, and cdk-lib templates
- feat: :tada: Started the project with few stuff

### 🐛 Bug Fixes

- fix(ci): :bug: add workflow_call trigger to CI workflow
- fix: :bug: Fixed tests

### ### chore

- chore: :wrench: add CI/CD workflows and clean up analysis files
- chore(kiro): :wrench: add CDK/ECS agent templates and align steering docs

### 📚 Documentation

- docs: :memo: add org-wide community health files, ADRs, and improved documentation

### ### test

- test(cli): :white_check_mark: add comprehensive test suite for CLI

### ### refactor

- refactor(cli): :recycle: extract shared constants and remove duplications
