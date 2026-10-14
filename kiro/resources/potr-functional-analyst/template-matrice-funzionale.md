# Template: Matrice Funzionale

Usa questa struttura per generare `docs/matrice-funzionale.md`.

---

```markdown
# Matrice Funzionale — {Nome Progetto}

## Informazioni Documento

| Campo | Valore |
|-------|--------|
| Revisione | v1 — {data} |
| Redatto da | {nome} |
| Applicativo | {nome progetto} |

## Profili

| Profilo | Descrizione sintetica | Piattaforma |
|---------|----------------------|-------------|
| {profilo 1} | {descrizione breve} | Web |
| {profilo 2} | {descrizione breve} | Mobile |
| ... | ... | ... |

## Legenda

| Simbolo | Significato |
|---------|-------------|
| ✓ | Accesso completo (lettura + scrittura) |
| 👁 | Sola lettura |
| – | Nessun accesso |
| ★ | Solo i propri dati |

## Matrice Permessi

### {Area Funzionale 1}

| Funzionalità | {profilo 1} | {profilo 2} | {profilo 3} | ... |
|--------------|-------------|-------------|-------------|-----|
| {funzionalità 1} | ✓ | 👁 | – | ... |
| {funzionalità 2} | ✓ | ★ | – | ... |

### {Area Funzionale 2}

| Funzionalità | {profilo 1} | {profilo 2} | {profilo 3} | ... |
|--------------|-------------|-------------|-------------|-----|
| ... | ... | ... | ... | ... |

## Note

- {Note specifiche su eccezioni, deroghe, o regole particolari per determinati profili}
```
