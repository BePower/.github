---
name: post-task-summary
description: "[DEPRECATED] Summarize changes and suggest a commit message when the agent finishes a task."
trigger: agentStop
runtime: any
deprecated: true
superseded_by: "KiroCrew 0.7 native end-of-task summary — keeping this hook produces a duplicate summary."
---

# Post-Task Summary — DEPRECATED

> **DEPRECATED (kept for review, not auto-removed).**
> KiroCrew 0.7 emits a native end-of-task summary, so this hook is redundant and
> would produce a second, duplicate summary. Recommendation: archive.

---

## Original behavior (for reference)

When finishing a task, provide:

1. **Changed files** — list of files created, modified, or deleted
2. **What changed** — one-sentence summary of the change
3. **Suggested commit message** — following the project's commit conventions:
   ```
   type(scope): :emoji: short description

   Detailed body explaining what and why.
   ```

Do NOT actually commit. The developer handles all git operations manually.
