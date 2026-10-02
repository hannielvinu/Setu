# Setu: Cancer Treatment Dropout Recovery

> Reminders don't bring patients back. Removing their barrier does.

**Health-a-thon 2026 · Team MedNova**
Track: Cancer · Primary user: Doctor / Care Team · Use case: Patient Follow-up & Continuity of Care

**Live demo:** https://hannielvinu.github.io/Setu/ (synthetic data, fictional hospital)

---

## The problem

Cancer patients in India quietly drop out between treatment steps. In one South Indian cohort, 12% of cervical cancer patients did not complete planned treatment and 34% of those who did were lost to follow-up. Living more than 100 km from the hospital is a consistent risk factor. Hospitals depend on coordinators who comb registers and cold-call patients, and the *reason* a patient left is rarely recorded. Many dropouts are driven by non-clinical barriers: scheme paperwork, travel and lodging costs, family duties, feeling better, or fear of side effects.

## What Setu does

An assistive agent for cancer care teams that closes the loop from *overdue* to *back in care*:

| Step | What happens | Who decides |
|---|---|---|
| **Find** | Clinician-defined pathway templates + simple rules flag overdue patients from existing exports or clerk-verified register photos | Clinician sets pathways and tiers |
| **Reach** | Heads-up message, then a consented voice call in the patient's language; WhatsApp voice-note, SMS and missed-call fallbacks | Patient consent on file |
| **Understand** | Identity check, then one question: *what is stopping you from coming?* The AI only sorts the answer into a fixed list of non-clinical barriers | Fixed label set |
| **Resolve** | Rebook a vacant slot, send the scheme document checklist, share lodging help, loop in the caregiver, or hand over to a person | Deterministic rules + people |
| **Measure** | Return-to-care tracking and a hospital dashboard of *why* patients drop out | Hospital leadership |

## Safety and scope by design

Setu does **not** diagnose, recommend treatment, provide clinical decision support, score clinical risk, interpret medical data or give clinical advice.

- **Operational priority, not risk scoring:** `priority = days overdue × clinician tier × (1 + 0.5 × past misses)` ([`priority.js`](app/src/engine/priority.js))
- **Emergency card, not triage:** if a reply matches the hospital's own "when to come to emergency" card, Setu reads the hospital's instruction word for word and alerts the on-call nurse. Ambiguous matches are treated as emergencies. All other symptoms go to a nurse queue verbatim, with no advice. ([`classifier.js`](app/src/engine/classifier.js))
- **Human-verified data:** only six non-clinical fields are digitised (reg. no., name, phone, pathway, visit no., last visit date). No drugs, doses or diagnoses. A clerk approves every row; sanity checks block impossible values. ([`verify.js`](app/src/engine/verify.js))
- **Privacy (DPDP):** consent at enrolment, neutral sender name, identity check (birth year or card digits) before any appointment detail; a wrong person hears only "please ask them to call back".
- **Scripts owned by clinicians:** the agent speaks only pre-approved lines ([`scripts.js`](app/src/engine/scripts.js)).

## Try the demo

1. **Worklist:** overdue patients ranked by operational priority.
2. **Outreach agent:** pick *Shanti Devi*, send the heads-up, place the call, reply as her son, give the birth year, then tap *"Ayushman card expired and the bus fare is too much"*. Book a slot.
3. Try *"I have had fever since yesterday"* (emergency-card path) or *"I feel very weak and tired"* (nurse queue), and *Simulate call drop* (WhatsApp fallback).
4. **Verify register:** fix the OCR errors (short phone number, future date, unreadable name) before approval.
5. **Barrier dashboard** and **Pathways & safety:** change a tier and watch the worklist re-rank.

## What this prototype is, and is not

This is a working front-end prototype with the real decision logic (pathway engine, priority, classifier rules, verification checks) and **synthetic data only**. Telephony and language are simulated in the browser. The production design replaces them with:

| Layer | Prototype | Production plan |
|---|---|---|
| Voice and language | Browser speech synthesis, keyword classifier (EN/HI) | Sarvam AI speech-to-text, text-to-speech and LLM restricted to the same fixed labels |
| Channels | Simulated | Exotel voice + missed-call numbers, WhatsApp Business API (templates, Flows), DLT-registered SMS |
| Backend | In-browser state | FastAPI, PostgreSQL, JSON pathway rule engine, LangGraph orchestration |
| OCR | Pre-computed sample output | Vision OCR limited to the six fields, with the same clerk verification screen |
| Hosting | GitHub Pages | India-hosted, encrypted, consent-managed, audit-logged |

## Run locally

```bash
cd app
npm install
npm run dev     # http://localhost:5173
npm test        # engine unit tests
```

## Repository layout

```
app/
  src/engine/      pathway priority, classifier, verification checks, scripts (+ tests)
  src/data/        pathway templates (JSON) and synthetic demo data
  src/components/  worklist, outreach agent, register verification, nurse queue, dashboard, pathways
docs/              concept note and architecture
.github/workflows/ test + deploy to GitHub Pages
```

## Evidence

- Loss to follow-up among cervical cancer patients, South India: [PMC9199505](https://pmc.ncbi.nlm.nih.gov/articles/PMC9199505)
- Paediatric AML abandonment in India: [IJMPO 2019](https://www.ijmpo.org/assets/articles/2019/pdf/ijmpo.ijmpo_84_18.pdf)
- ABDM interoperability gaps: [HMPI 2026](https://hmpi.org/2026/07/09/from-infrastructure-to-impact-operationalizing-indias-ayushman-bharat-digital-mission/)
- Human navigator programmes, e.g. [TMC KEVAT](https://tmc.gov.in/index.php/kevat-patient-navigator)

All patient names, numbers and records in this repository are fictional. "Arogya Hospital" is a fictional demo hospital.
