# Template: Steering — Domain

Usa questa struttura per generare `.kiro/steering/domain.md`.
Questo file è per il team tecnico. Lingua: inglese.

---

```markdown
# Domain Model

## Entities

### {EntityName}

{One-line description of what this entity represents.}

| Field | Description | Constraints |
|-------|-------------|-------------|
| {field} | {what it stores} | {required, unique, max length, etc.} |

### {EntityName2}
...

## Relationships

```
{ASCII diagram showing entity relationships}

Entity1 ──1:N──▶ Entity2
Entity2 ──N:1──▶ Entity3
Entity1 ──N:M──▶ Entity4
```

## Business Rules

| ID | Rule | Entities Involved |
|----|------|-------------------|
| BR-01 | {rule description} | {Entity1, Entity2} |
| BR-02 | ... | ... |

## State Machines

### {Entity} States

```
{State diagram in ASCII or description}

Created → Active → Completed
              ↘ Cancelled
```

Transitions:
- Created → Active: {trigger}
- Active → Completed: {trigger}
- Active → Cancelled: {trigger}

## Computed Values

| Value | Formula / Logic | Used By |
|-------|-----------------|---------|
| {name} | {how it's calculated} | {which flows use it} |
```
