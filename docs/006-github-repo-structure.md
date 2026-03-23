# ADR 006: Single `.github` repo for CLI + org defaults

**Status**: Accepted

## Context

GitHub recognizes a special repository named `.github` in an organization. Files placed in this repo are inherited as defaults by all other repos in the org:
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`
- `profile/README.md` (org profile)

Separately, `@bepower/dev` is a CLI tool + golden config distributor that also defines org-wide standards.

Options:
1. **Two repos** — `BePower/.github` for community health + `BePower/dev` for the CLI
2. **One repo** — `BePower/.github` containing both

## Decision

Use a **single `BePower/.github` repo** that serves both purposes.

## Consequences

### Positive
- Single source of truth for all BePower standards
- Less maintenance overhead (one repo, one CI, one set of issues)
- Community health files live where GitHub expects them
- CLI source and org defaults evolve together

### Negative
- Repo name (`.github`) doesn't obviously indicate it contains a CLI tool
- `package.json` `name` (`@bepower/dev`) differs from repo name (`.github`)

### Mitigation
- README clearly explains the dual purpose
- `package.json` `homepage` and `repository` fields point to the correct repo
