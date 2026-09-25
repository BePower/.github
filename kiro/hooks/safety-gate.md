---
name: safety-gate
description: Block dangerous shell commands before execution.
trigger: preToolUse
toolName: shell
runtime: any
---

# Safety Gate

> `runtime: any` — this guard applies in every runtime (IDE and autonomous
> KiroCrew alike). It is intentionally mirrored by the `deniedCommands` in each
> agent JSON (defense in depth): the hook catches it at the event layer, the
> agent config catches it at the tool layer.

Before executing any shell command, verify it does NOT:

1. **Commit or push**: `git commit`, `git push`, `git tag`
2. **Publish**: `npm publish`
3. **Deploy infrastructure**: `cdk deploy`, `cdk destroy`
4. **Destructive ops**: `rm -rf /`, `rm -rf ~`, `rm -rf .git`
5. **Credential access**: `cat ~/.ssh`, `cat ~/.aws`, `printenv | grep SECRET`

If the command matches any of these patterns:
- **BLOCK** the command
- Explain why it was blocked
- Suggest the safe alternative (e.g., "prepare the commit message and I'll commit manually")
