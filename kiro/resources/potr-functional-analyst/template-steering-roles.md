# Template: Steering — Roles

Usa questa struttura per generare `.kiro/steering/roles.md`.
Questo file è per il team tecnico. Lingua: inglese.

---

```markdown
# Roles & Permissions

## Roles

| Role | Platform | Description |
|------|----------|-------------|
| {role} | Web / Mobile / Both | {what this user does} |

## Permission Matrix

### {Functional Area}

| Permission | {role1} | {role2} | {role3} |
|------------|---------|---------|---------|
| {action} | ✓ | – | 👁 |

## Access Rules

| Rule | Description |
|------|-------------|
| {rule name} | {when/how access is granted or denied} |

## Role Hierarchy

```
{If roles have inheritance or composite relationships}

admin
  ├── includes: viewer permissions
  └── includes: editor permissions
```

## Authentication Requirements

- {SSO required}
- {MFA for certain roles}
- {Session duration}
- {Device restrictions}
```
