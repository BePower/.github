# Template: Steering — Architecture

Usa questa struttura per generare `.kiro/steering/architecture.md`.
Questo file è per il team tecnico. Lingua: inglese.

---

```markdown
# Architecture

## System Components

```
{ASCII diagram showing components and data flow}

[Web Portal] ──────▶ [Backend API] ──────▶ [Database]
[Mobile App] ──────▶ [Backend API] ──────▶ [File Storage]
                          │
                          ▼
                    [Auth Provider]
```

## Components

| Component | Purpose | Users |
|-----------|---------|-------|
| {component} | {what it does} | {which roles use it} |

## Constraints

| Constraint | Reason | Impact |
|------------|--------|--------|
| Must work offline | Field operators in areas without connectivity | Mobile app needs local storage + sync |
| Multi-language | Operations across multiple countries | All user-facing text must be translatable |
| SSO | Corporate security policy | Integration with company identity provider |
| ... | ... | ... |

## Data Flow

### {Flow Name}

```
{Actor} → {Component} → {Component} → {Storage}
```

Key points:
- {important detail about this flow}

## Integration Points

| System | Direction | Purpose |
|--------|-----------|---------|
| {external system} | Inbound / Outbound / Both | {what data is exchanged} |

## Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Offline support | Mobile app must queue operations | Sync on reconnect |
| Notifications | Push to mobile users | Task assignments, approvals |
| File uploads | Photos from field | Max size, formats |
| ... | ... | ... |
```
