---
name: skill-templates
description: Generate .kiro/skills/ for a project. Use when adding skills like new-package scaffolding to a monorepo.
---

# Skill Templates

Generate project-specific skills under `.kiro/skills/`.

## Available Skills

### new-package (monorepos only)
Scaffolds a new package in a monorepo. Includes:
- Directory structure, package.json, src/index.ts, test file
- README.md, CHANGELOG.md
- Updates .vscode/settings.json scopes

### new-stack (CDK projects only)
Scaffolds a new CDK stack. Includes:
- Stack class extending `@bepower/bep-cdk-lib` base
- Integration into the stage file
- Test file with Template assertions
- Proper naming conventions

## When to Include

- `new-package` — Only for monorepo projects with `workspaces` in package.json
- `new-stack` — Only for CDK projects using `@bepower/bep-cdk-lib`

## References
- Review `references/new-package.md` for the new-package skill content
- Review `references/new-stack.md` for the new-stack skill content
