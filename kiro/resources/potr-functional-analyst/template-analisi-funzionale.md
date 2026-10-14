# Template: Analisi Funzionale

Usa questa struttura per generare `docs/analisi-funzionale.md`.

---

```markdown
# Analisi Funzionale — {Nome Progetto}

## Informazioni Documento

| Campo | Valore |
|-------|--------|
| Revisione | v1 — {data} |
| Redatto da | {nome analista} |
| Approvato da | {nome manager — lasciare vuoto se non noto} |
| Dipartimento richiedente | {dipartimento} |
| Referente business | {nome} |

## Storico Modifiche

| Rev. | Data | Autore | Note |
|------|------|--------|------|
| 1 | {data} | {autore} | Prima emissione |

---

## 1. Introduzione

{Breve descrizione del contesto: chi ha richiesto il progetto, perché, quale dipartimento è coinvolto.}

## 2. Glossario

| Termine | Descrizione |
|---------|-------------|
| {termine} | {definizione nel contesto del progetto} |

## 3. Situazione Attuale (As Is)

{Descrizione di come si opera oggi. Strumenti usati, processi manuali, problemi riscontrati, inefficienze.}

## 4. Obiettivi (To Be)

{Cosa si vuole ottenere con il progetto. Benefici attesi per l'azienda e per gli utenti.}

## 5. Architettura della Soluzione

{Descrizione ad alto livello dei componenti:
- Portale web / applicazione mobile / backend
- Come interagiscono tra loro
- Vincoli rilevanti (offline, multilingua, SSO, notifiche...)

Nessun nome di tecnologia. Diagramma Mermaid se utile.}

## 6. Utenti e Ruoli

| Ruolo | Piattaforma | Descrizione |
|-------|-------------|-------------|
| {ruolo} | Web / Mobile / Entrambi | {cosa fa questo utente} |

## 7. Flussi Funzionali

### 7.1 {Nome del flusso}

**Attore**: {ruolo}
**Precondizioni**: {cosa deve essere vero prima}

**Flusso principale**:
1. {passo 1}
2. {passo 2}
3. ...

**Regole di business**:
- {regola 1}
- {regola 2}

**Eccezioni e casi limite**:
- {caso}: {comportamento}

{Diagramma Mermaid se il flusso è complesso}

### 7.2 {Nome del flusso successivo}
...

## 8. Requisiti Funzionali

| ID | Area | Requisito | Priorità |
|----|------|-----------|----------|
| RF-01 | {area} | {descrizione} | Must / Should / Could |
| RF-02 | ... | ... | ... |

## 9. Requisiti Non Funzionali

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF-01 | Disponibilità offline | {descrizione} |
| RNF-02 | Multilingua | {descrizione} |
| RNF-03 | Sicurezza | {descrizione} |
| RNF-04 | Performance | {descrizione} |

## 10. Acceptance Criteria

| ID | Descrizione |
|----|-------------|
| AC-01 | {condizione verificabile che deve essere vera per accettare il progetto} |
| AC-02 | ... |

## 11. Use Cases

| ID | Attore | Precondizioni | Azione | Risultato atteso |
|----|--------|---------------|--------|------------------|
| UC-01 | {ruolo} | {stato iniziale} | {cosa fa l'utente} | {cosa succede} |

## 12. Punti Aperti

| # | Descrizione | Owner | Stato |
|---|-------------|-------|-------|
| 1 | {domanda/decisione non presa} | {chi deve rispondere} | Aperto |
```
