# Hooks — `runtime` tagging + `init-kiro` filtering

Hooks are tagged by the runtime they make sense in, instead of being split into
`ide/` vs `safety/` folders. Files stay flat; a front-matter field decides who
gets them.

## The `runtime` field

| Value | Meaning | Example |
|-------|---------|---------|
| `any` | Applies in every runtime — IDE and autonomous KiroCrew alike. | `safety-gate.md` |
| `ide` | Only meaningful with a human in an editor (fires on IDE file events; no-op headless). | `barrel-export.md` |

Deprecated hooks additionally carry:

```yaml
deprecated: true
superseded_by: "<what replaces it>"
```

They are **kept, not deleted**, pending a decision on whether to archive them:

| Hook | runtime | Status |
|------|---------|--------|
| `safety-gate.md` | `any` | KEEP |
| `barrel-export.md` | `ide` | KEEP (IDE-only) |
| `context-injection.md` | `ide` | DEPRECATED → superseded by Skills-Discovered-by-Search |
| `post-task-summary.md` | `any` | DEPRECATED → superseded by native end-of-task summary |

## How `init-kiro` should filter (proposed)

`init-kiro` copies `kiro/hooks/*` into `~/.kiro/hooks/`. Proposed behavior:

- **Default (IDE developer):** install all non-deprecated hooks (`runtime: any`
  and `runtime: ide`). Deprecated hooks are skipped by default.
- **Headless / autonomous mode** (e.g. a future `--headless` / `--autonomous`
  flag): install only `runtime: any` hooks; skip `runtime: ide` (they can never
  fire without editor events) and skip `deprecated: true`.
- The installer reads the `runtime` and `deprecated` front-matter fields to decide.

## Agent distribution decision

- **All agents ship to everyone.** No conditional selection; consistent with how
  `init-kiro` copies the whole `kiro/` payload. `upgrade-guardian` and the generic
  `rev-eng` are distributed globally like `bepower-setup` and `functional-analyst`.
- **`rev-eng` stays global**, not scaffolded conditionally on "is this an
  api-client project". It self-contextualizes at runtime; if the project has no
  target to reverse-engineer, the agent simply has nothing to do — no conditional
  install logic is needed.
