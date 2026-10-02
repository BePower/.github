---
name: upgrade-guardian
description: "Assess whether a dependency/framework upgrade is safe. Read-only worktree analysis of breaking changes, project impact, and verification, ending in a LOW/MEDIUM/HIGH verdict. Reusable by any agent via skill_search. Use before applying any dependency bump."
---

# Upgrade Guardian

**Cognitive mode: Release-Safety Engineer (read-only)**

This SKILL is the **core logic** of upgrade safety assessment. Any agent can load
it on demand (`skill_search`); the `upgrade-guardian` agent is only a thin
read-only wrapper around it. An upgrade is a claim ("this is safe") until proven —
prove it in isolation, then hand a reasoned verdict to the human. Never mutate the repo.

## Trigger

Invoke with: `upgrade guardian`, `check upgrade`, or `is it safe to upgrade <pkg>`.

## Pre-flight — context first

1. **Read the project context BEFORE anything else**: `README.md`, `AGENTS.md`
   (or `CLAUDE.md`), `package.json` (name, scripts, deps, `workspaces`, `engines`),
   and `.kiro/steering/**`. Detect build/test/lint tooling and project type from
   real files — do not assume.
2. **Deduce the target** if not named (`npm outdated`, a Dependabot/renovate branch,
   the package under discussion). Confirm the target and the `from → to` range.

## Depth by Semver

Scale effort to the version delta:

| Bump | Trust | Analysis depth |
|------|-------|----------------|
| **patch** (`x.y.Z`) | High | Confirm it is truly a patch (changelog headline), run build+test. |
| **minor** (`x.Y.z`) | Medium | Skim changelog for new/deprecated APIs, grep usage of anything deprecated, run build+test. |
| **major** (`X.y.z`) | Low | Full migration analysis: changelog + migration guide, AST/grep of every changed API, cross-repo layer, run build+test. |

## Playbook (6 steps)

### 1. Isolate
Create a worktree + branch so nothing touches the working tree:
```bash
BASE=$(git branch --show-current)
git worktree add ../upgrade-<pkg>-<version> -b chore/upgrade-<pkg>-<version>
```
Do all work inside the worktree. (Creating a worktree/branch is allowed; committing,
pushing and tagging are not.)

### 2. Real breaking-change analysis
- Fetch the **changelog** and **migration guide** for the target version range
  (`web_fetch` GitHub releases / CHANGELOG, `npm view <pkg> versions`).
- List concrete breaking changes: removed/renamed exports, changed signatures,
  changed defaults, dropped runtime/engine support, ESM/CJS shifts, peer-dep bumps.
- Distinguish **announced** breaking changes from **behavioral** ones (default changes).

### 3. Project impact
- For each changed/removed API, find real usage in this project:
  `grep`/`code` (AST) for import specifiers and call sites of the affected symbols.
- Check peer dependencies and `engines` compatibility (Node >= 22 for BePower).
- For monorepos, check **every** workspace package, not just the root.
- Produce a table: affected file → symbol → change → required edit.

### 4. Verify (in the worktree only)
Install the candidate **inside the worktree** and run the project's own checks —
never `--save` into the real tree:
```bash
# inside the worktree
npm install <pkg>@<version> --no-save
npm run build   # if a build script exists
npm run lint    # if configured
npm test        # if tests exist
```
Record which checks exist, which passed, which failed, and the first real error
per failure. If a check does not exist, say so — do not invent one.

### 5. Cross-repo layer (shared libraries)
When the candidate is a **shared BePower library** (e.g. `@bepower/bep-cdk` ~139
consumers, `@bepower/mw-becharge-globals` ~30), a single-repo verdict is not enough:
- **Fast pass (all consumers):** identify consumer repos, grep their imports of the
  changed APIs + read the changelog. Flag which consumers touch changed surface.
- **Deep pass (candidates only):** for the consumers that actually use changed APIs,
  clone read-only and run `tsc`/build against the candidate to confirm.
- Report blast radius (e.g. "changed API used by 12 of 139 consumers").

### 6. Verdict
Deliver a reasoned risk rating with evidence:
- **Risk: LOW** — patch/minor, no affected usage, checks green.
- **Risk: MEDIUM** — bounded edits needed, or minor with deprecations in use.
- **Risk: HIGH** — major with real breaking usage, engine/peer conflicts, or red checks.

Then **clean up**: `git worktree remove` the throwaway worktree, or list it for
the human if removal is unsafe.

## Output Format

```markdown
# Upgrade Safety Report: {pkg} {from} → {to}

## Verdict
- **Risk: {LOW | MEDIUM | HIGH}**
- Semver: {patch | minor | major}
- Recommendation: {apply as-is / apply with edits / hold — reason}
- Estimated effort: {trivial / {N} files / significant migration}

## Breaking Changes (real)
- {change} — source: {changelog/migration link}

## Project Impact
| File | Symbol | Change | Required edit |
|------|--------|--------|---------------|
| `path` | `api` | {what changed} | {what to do} |

(none found → "No affected usage in this project.")

## Verification (worktree)
| Check | Exists | Result |
|-------|--------|--------|
| build | ✅/❌ | ✅/❌ {first error} |
| lint  | ✅/❌ | ✅/❌ |
| test  | ✅/❌ | ✅/❌ |

## Cross-Repo Blast Radius (shared libs only)
- Consumers touching changed surface: {N}/{total}
- Deep-checked: {repos + result}

## Open Questions
- {anything the human must decide}

## Suggested Commit (for the human — NOT executed)
```
chore(deps): :arrow_up: upgrade {pkg} to {to}

{what changed and why}
```
```

## Principles (read-only, non-negotiable)

- **READ-ONLY on the repo.** Never `git commit`, `git push`, `git tag`,
  `npm publish`, `gh pr create/merge`, and never `--save` a dependency into the
  real working tree. Do work in a worktree and report; the human applies changes.
- **Evidence over opinion.** Every breaking change cites a changelog/migration
  source; every impact row cites a real file. No guessing.
- **Verify against current docs**, not memory — fetch the actual changelog for the
  version range before claiming what changed.
- **Clean up worktrees** you create, or list them for the human if removal is unsafe.
- **npm only** (never pnpm/yarn). Respect `engines` (Node >= 22).
