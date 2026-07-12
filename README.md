# RegIntel-AI

**AI-Powered SEBI Compliance Intelligence Platform**

RegIntel-AI turns unstructured SEBI regulatory text — circulars, master circulars, frameworks — into structured, trackable, auditable compliance obligations, automatically. Built for SEBI TechSprint Problem Statement 2: *Agentic Compliance — From Regulatory Text to Operational Action.*

---

## The Problem

SEBI issues circulars, master circulars, and amendments on an ongoing basis, each carrying obligations for specific intermediary categories. Compliance teams currently read these manually, page by page, to identify what changed and who inside the organization must act — a process that is slow, resource-intensive, and prone to missed obligations or inconsistent interpretation, especially at smaller intermediaries.

The core issue: regulatory text is unstructured and human-readable, while compliance operations need structured, machine-actionable data. RegIntel-AI bridges that gap.

## Intermediary Category & Regulatory Corpus

- **Intermediary category:** Stockbrokers and Investment Advisers
- **Regulatory corpus:** SEBI Master Circulars, circulars, frameworks, and clarifications applicable to these categories (publicly available on SEBI's website)

---

## What's Built Today

RegIntel-AI has three working pipelines, plus a dashboard and workflow layer built on top of them.

### 1. Obligation Extraction
Upload a SEBI circular as a PDF. The backend extracts and chunks the text with **PyMuPDF**, then sends each chunk to **Gemini** with a compliance-analyst system prompt. Gemini returns structured, per-clause obligations — validated against a strict schema before being stored:

| Field | Description |
|---|---|
| `clause` | Clause/section/paragraph reference |
| `regulation` | Source circular or framework |
| `department` | Responsible internal function |
| `action` | What must be done to comply |
| `deadline` | Due date or cadence |
| `frequency` | Recurrence pattern |
| `evidence` | Proof of compliance expected |
| `penalty` | Consequence of non-compliance |
| `risk` | High / Medium / Low |

### 2. Change Detection
When a new version of a circular is uploaded, RegIntel-AI compares it against the previous version at clause level and classifies every difference as **Added**, **Modified**, or **Removed** — turning a manual multi-page diff into an instant, structured comparison.

### 3. Retrieval-Grounded AI Assistant
A RAG-based assistant lets users ask compliance questions in natural language. It retrieves relevant excerpts from the uploaded document corpus, cross-references them with already-extracted obligations, and generates an answer **grounded strictly in that retrieved content** — explicitly stating when a question can't be answered from the uploaded documents, rather than guessing.

### Dashboard & Workflow
- **Compliance Dashboard** — a live view of every obligation by department, clause, deadline, and risk.
- **Workflow Tasks** — obligations are automatically converted into owned, due-dated tasks on a workflow board for department-level tracking (deterministic, rule-based — no extra LLM call, so it's fast and never hallucinates a due date).

---

## Architecture

```
Frontend (Next.js)  ──REST──►  Backend (FastAPI)
                                    │
                     ┌──────────────┼───────────────┐
                     ▼              ▼                ▼
              PyMuPDF Parser   Gemini API      Obligation / Task /
              (extract+chunk)  (extraction+    Chat Store
                                 RAG answers)   (structured JSON)
```

```
app/
  main.py              FastAPI app, CORS, router registration
  config.py            Environment-driven settings (pydantic-settings)
  routes/               upload · obligations · tasks · chat
  services/
    pdf_parser.py        PyMuPDF text extraction + chunking
    gemini_service.py    Gemini API client
    prompt_templates.py  Extraction & chat system/user prompts
    extractor.py          Chunk → Gemini → validate → dedupe
    retriever.py          TF-IDF-based chunk retrieval for RAG
    chat_service.py       RAG pipeline orchestration
    workflow_generator.py Obligation → Task conversion (rule-based)
    change_detector.py    Version comparison (Added/Modified/Removed)
  schemas/              Pydantic request/response models
  models/               Store modules (obligations, tasks, chat, documents)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Radix UI, shadcn/ui, Lucide Icons |
| **Data/Forms** | React Hook Form, Zod, TanStack Table, Recharts, Framer Motion |
| **Backend** | FastAPI (Python), Pydantic (schema validation + AI-output validation) |
| **AI** | Google Gemini API, Retrieval-Augmented Generation, prompt-grounded extraction |
| **Document Processing** | PyMuPDF (PDF text extraction, page-aware chunking) |
| **Storage** | Structured JSON store *(prototype)* → PostgreSQL + vector index *(roadmap)* |
| **API** | CORS-enabled REST API (frontend ↔ backend) |
| **DevOps** | Docker, Docker Compose |
| **Version Control** | Git, GitHub |

---

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Swagger UI: `http://localhost:8000/docs`

| Endpoint | Description |
|---|---|
| `POST /upload` | Upload a PDF, extract & store obligations |
| `GET /obligations` | List all extracted obligations |
| `GET /changes` | Version comparison (added/modified/removed) |
| `GET /tasks`, `POST /tasks/generate` | Workflow task management |
| `POST /chat` | Ask the AI Assistant a grounded question |
| `GET /health` | Service health check |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`.

---

## Demo Scenario

The platform is tested end-to-end against the **SEBI Master Circular for Stockbrokers / Investment Advisers**, including a real amendment clause — demonstrating obligation extraction and change detection on genuine, publicly available regulatory text.

---

## Roadmap

The current prototype proves the core extraction → change detection → assistant → workflow loop. Next phase priorities:

- **Role-Based Access** — Compliance Head, Department Head, and Employee roles, each scoped to the obligations/tasks they're accountable for
- **PostgreSQL + Vector Index** — move off flat-file storage; upgrade retrieval from TF-IDF to embedding-based semantic search
- **Evidence-Linked Compliance** — attach evidence per obligation, with an AI plausibility check against the requirement
- **Full Audit Trail** — every extraction, assignment, and status change logged with actor and timestamp
- **Automated Notifications** — departments emailed the moment a new or updated obligation lands
- **OCR Support** — handle scanned, image-only circulars
- **Multi-Regulator Support** — extend the same engine to RBI, IRDAI, and MCA corpora via a config-driven regulatory profile

---

## Target Users & Commercial Potential

SEBI-regulated entities — stockbrokers, investment advisers, mutual funds/AMCs, depositories, portfolio managers, and clearing corporations — as a SaaS subscription, with potential for enterprise licensing and API access for RegTech integrators as the platform matures. The underlying engine is regulator-agnostic by design.

---

## Team

Team RegIntel — SEBI Securities Market TechSprint, Problem Statement 2.
