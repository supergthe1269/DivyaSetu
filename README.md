<p align="center">
  <img src="https://img.icons8.com/fluency/96/wheelchair.png" alt="DivyaSetu Logo" width="80"/>
</p>

<h1 align="center">♿ DivyaSetu</h1>
<h3 align="center">Assistive Device Access & Redistribution Network</h3>
<h4 align="center">Challenge Track T7 — Inclusion & Accessibility</h4>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/PostGIS-3-68A063?logo=postgis" alt="PostGIS">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/LangChain-0.2-1C3C3C?logo=langchain" alt="LangChain">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DBMS_Concepts-14-blue" alt="14 DBMS Concepts">
  <img src="https://img.shields.io/badge/Tables-11-green" alt="11 Tables">
  <img src="https://img.shields.io/badge/API_Endpoints-25+-orange" alt="25+ APIs">
  <img src="https://img.shields.io/badge/AI_Assistant-Scoped-purple" alt="Scoped AI Assistant">
  <img src="https://img.shields.io/badge/Team-3-important" alt="Team of 3">
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Abstract](#-abstract)
- [Objectives](#-objectives)
- [How It Works](#-how-it-works--the-circulation-loop)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [DBMS Concepts Demonstrated](#-dbms-concepts-demonstrated)
- [Matching Algorithm](#-matching-algorithm)
- [AI Assistant — Scoped for Reliability](#-ai-assistant--scoped-for-reliability)
- [API Endpoints (High-Level)](#-api-endpoints-high-level)
- [Frontend Pages](#-frontend-pages)
- [Project Structure](#-project-structure)
- [20-Day Build Plan](#-20-day-build-plan)
- [Team Workflow (3 Members)](#-team-workflow-3-members)
- [Installation & Setup](#-installation--setup)
- [Cut Scope — Why These Are Gone](#-cut-scope--why-these-are-gone)
- [Deliverables](#-deliverables)
- [License](#-license)

---

## 🎯 Problem Statement

Persons with disabilities in India who need mobility, hearing, or vision assistive
devices — wheelchairs, hearing aids, crutches, tricycles, Braille kits, prosthetics —
depend almost entirely on **periodic, offline distribution camps** run by government
schemes and NGOs. Between camps, there is **no ongoing digital channel** through which
a working device sitting unused in one household can reach a beneficiary who needs it
elsewhere.

### The Gap, Broken Down

| Problem | Impact |
|---------|--------|
| **Mismatch frequency** | Camps happen episodically; need is continuous (post-injury, progressive conditions) |
| **Geographic inversion** | Surplus concentrates in cities (hospitals, donors, NGOs); need concentrates in rural/semi-urban areas |
| **Trust deficit in used goods** | Beneficiaries fear broken/dangerous gear; donors see no trusted donation channel |
| **Verification vacuum** | No one certifies that a used wheelchair is safe or a reconditioned hearing aid works |
| **Information asymmetry** | NGOs plan camps on guesses; no real-time aggregated local need |
| **Last-mile cost** | Shipping oversized devices often costs more than their value; nobody covers it |

> **DivyaSetu converts the episodic, camp-based model into a continuous, location-aware
> redistribution network** — an unused device in one household is verified, matched by
> geospatial + scoring logic, and delivered to a verified beneficiary's need.

---

## 📝 Abstract

DivyaSetu (दिव्यसेतु — "Divine Bridge") is a full-stack DBMS project that digitizes
the **assistive-device redistribution lifecycle**: a donor lists a device → a certified
verifier inspects and certifies it → a PostgreSQL/PostGIS geospatial engine matches it
to a verified beneficiary's need → the transfer is tracked to completion → beneficiary
feedback can re-list the device for its next user.

The platform is built on **PostgreSQL 16 + PostGIS** for native geospatial queries and
demonstrates **14 DBMS concepts, every one load-bearing in the working product** —
full ACID transactions with row-level locking (preventing double-allocation of the
same wheelchair), a PL/pgSQL trigger, a stored procedure, a dashboard view, a window
function, GiST geo-indexing, full-text search, and application-layer RBAC — surfaced
through a clean web UI and a **scoped natural-language assistant** that lets NGO field
staff query a small, safe set of read-only questions in plain English.

> **Design philosophy:** fewer concepts, each one real and demoable, beats a longer
> checklist with half of it fragile. Every feature below is in the product because the
> product needs it — not because it was addable.

---

## 🎯 Objectives

- **Continuity** — Replace episodic camps with a year-round redistribution channel.
- **Trust** — Every device carries a verified "digital twin": condition ledger, certification, transfer history.
- **Reach** — Geo-matching is central: the right device finds the nearest verified need.
- **Accessibility** — The platform itself is accessible (accessible UI, NGO field-worker assisted onboarding for non-smartphone users).
- **DBMS rigor** — Tie each relational concept to a working feature, not just a slide.
- **Finish the prototype** — A smaller, fully-working system beats a larger, partially-working one. This governs every scope call in this document.

---

## ♻️ How It Works — The Circulation Loop

```
DONOR                        PLATFORM                          SEEKER
list a device  →  verify & certify  →  match (geo + fit)  →  transfer  →  feedback → re-list
(photo, status)  (verifier: SAFE/NOT_SAFE)   (PostGIS radius + score)   (pickup+handover)  (reuse cycle)
```

**Device lifecycle (status ledger):**

```
AVAILABLE → CERTIFYING → MATCHED → IN_TRANSIT → DELIVERED → RE_LISTED
```

Every state change is appended to `audit_log`, giving each device an immutable, traceable history — the trust core of the platform.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **React 18 + Vite + Tailwind CSS 3** | Reusable pattern from prior Hospital project; fast UI |
| Data fetching | **React Query (TanStack) + Axios** | Server state, caching, optimistic updates |
| Backend | **Node.js + Express (REST, JWT)** | Same API-layer pattern as prior project |
| Database | **PostgreSQL 16 + PostGIS** | Relational rigor, full ACID, geospatial matching |
| ORM | **Prisma 5 (migrations + client)** | Type-safe schema and queries |
| Auth | **JWT + bcrypt + role guards** | Donor / Seeker / Verifier / Admin RBAC |
| Geo | **PostGIS** `geometry(Point,4326)` + GiST index, `ST_DWithin` | Native geo-radius matching — the core differentiator |
| AI Service | **Python FastAPI + LangChain 0.2** | Scoped, read-only NL→SQL assistant over 3–5 fixed query patterns |
| Containerization | **Docker Compose** (`postgis/postgis`) | Reproducible dev environment for a 3-person team |
| Notifications | In-app notification list (stubbed) | Deliberately deferred scope |

> **Why Docker for a team of 3:** one `docker compose up -d db` gives every member the
> identical PostGIS instance — no OS/version/extension drift, no "works on my machine."

---

## 🏗️ System Architecture

```
[Browser → React SPA (Tailwind, React Query)]
        │  REST / JSON (+ JWT bearer)
        ▼
[Express API Gateway] ────► [Auth: JWT + bcrypt, role guard]
        │
        ├──► [Prisma → PostgreSQL 16 + PostGIS]
        │       • geo GiST index, trigger, procedure, view, window fn
        │
        └──► [FastAPI + LangChain AI service]
                • Read-only DB role · scoped query patterns · no write path
```

Two runtimes — **Express** (transactional core) and **FastAPI** (AI assistant) — both
operating on the same **Postgres** source of truth. The AI service connects through a
**Postgres role with SELECT-only grants**, so a bad or malicious prompt structurally
cannot mutate data — this is enforced at the database layer, not just in application code.

---

## 🗄️ Database Design

### Core Tables (v1 schema — 11 tables)

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `users` | All actors, role-based | id, name, mobile, role (DONOR/SEEKER/VERIFIER/ADMIN), language, disability_type, geo (Point), approved |
| `device_types` | Reference catalog | id, category (wheelchair/hearing-aid/crutch/tricycle/braille/prosthetic) |
| `devices` | The asset + its lifecycle ledger | id, donor_id, type_id, condition, description, description_tsv, geometry, status (AVAILABLE→…→RE_LISTED), listed_at |
| `needs` | Demand requests from seekers | id, seeker_id, category, urgency_hours, geometry, monthly_income, status |
| `certifications` | Trust ledger | id, device_id, verifier_id, verdict (SAFE/NOT_SAFE), certificate_ref, expires_at, inspected_at |
| `matches` | Matching decisions | id, device_id, need_id, match_score, source, status (PROPOSED/ACCEPTED/REJECTED/CLOSED) |
| `transfers` | The handover | id, match_id, pickup_addr, dropoff_addr, porter_id, status, delivered_at |
| `feedback` | Post-transfer satisfaction + reuse intent | id, transfer_id, rating, notes, re_list_intent |
| `audit_log` | Immutable trust audit | id, table_name, record_id, action, payload (jsonb), actor_id, created_at |
| `otps` | Simple SMS-style verification | id, mobile, code, used, expires_at |
| `notifications` | In-app alerts | id, user_id, type, payload, seen |

*(Full Prisma schema + ER diagram + SQL recipes committed to the repo — see `/docs`.)*

> **Cut from v1:** no separate materialized-view table needed; district aggregates are
> served by a regular `VIEW` (see DBMS Concepts below). RLS policies are cut in favor of
> application-layer role guards — same practical access control, far less risk of a
> silent misconfiguration during the demo.

---

## 🧠 DBMS Concepts Demonstrated (14 — all load-bearing)

| # | Concept | Where |
|---|---------|-------|
| 1 | Normalization (3NF) | users/devices/needs/matches separated; no derivable data stored |
| 2 | Primary / Foreign keys | Every relationship FK-referenced |
| 3 | Check + unique constraints | verdict enums, `monthly_income >= 0`, donor mobile uniqueness |
| 4 | **ACID transaction + row-level locking** | `safe_match()` — `SELECT … FOR UPDATE` on device row → insert match → set device MATCHED, all-or-nothing. **Flagship demo: two seekers cannot claim the same wheelchair.** |
| 5 | Trigger (PL/pgSQL) | Auto-append to `audit_log` on match/re-list/status change |
| 6 | Stored procedure | `safe_to_transfer(device_id)` — verify + flip status atomically |
| 7 | View | District supply × demand aggregate, donor dashboard view |
| 8 | Window function | `ROW_NUMBER() OVER (PARTITION BY need_id ORDER BY score DESC)` → top-3 ranking |
| 9 | CTE | Candidate retrieval + scoring as a single query |
| 10 | GiST geospatial index | On `devices.geometry`, `needs.geometry` for radius queries |
| 11 | B-tree indexes | `devices.type_id`, `needs.status` |
| 12 | Full-text search | `to_tsvector` / `to_tsquery` over device descriptions |
| 13 | JSONB | `audit_log.payload` for flexible, queryable payloads |
| 14 | RBAC (app-layer + DB role) | JWT role guards in Express; separate **read-only Postgres role** for the AI service |

**Every concept above sits inside a feature a user actually touches in the demo path.**
Nothing here exists solely to pad a slide.

---

## 🧮 Matching Algorithm

```
score = w1·geoDistance + w2·categoryFit + w3·urgency − w4·demandSaturation
```

- **Geo first:** `ST_DWithin(need.geometry, device.geometry, radius)` pulls candidates
  (backed by a GiST index).
- **Fit & urgency:** device category must match the need; higher urgency (post-injury)
  ranks up. `ROW_NUMBER()` picks the top-3 per need.
- **Fixed radius for v1:** a single configured radius (e.g. 50 km) is used rather than
  progressive widening (city → district → state). Progressive widening is a v2
  enhancement — it adds branching logic without adding a new DBMS concept, so it's
  deferred in favor of finishing the core loop solidly.

The match outcome is persisted in `matches` with its score, keeping a transparent
decision record.

---

## 🤖 AI Assistant — Scoped for Reliability

The NL→SQL assistant is **kept, deliberately scoped down** so it stays a demo asset
rather than a demo risk.

**What it is:**
- Python FastAPI + LangChain 0.2, tuned with **few-shot examples against 3–5 fixed
  query patterns**, not a fully general open-ended NL→SQL agent.
- Supported example questions (the ones actually demoed):
  - *"Show me certified wheelchairs available within 50 km of Chennai."*
  - *"Top 10 urgent needs in Tamil Nadu that are still unmatched."*
  - *"Which devices have not been certified for more than 7 days?"*

**What it is not:**
- Not a general-purpose SQL agent that accepts arbitrary questions with unpredictable output.
- Not given write access at any layer.

**Safety, enforced structurally rather than by prompting alone:**
- The AI service connects to Postgres through a **dedicated SELECT-only database role** —
  even a successfully-injected prompt cannot execute a write, because the underlying
  credentials don't permit one. This is a real RBAC concept, not just a safety footnote.
- Generated queries are checked against an allowlist pattern before execution.

**Why scoped, not general:** a general NL→SQL agent is a strong demo when it works and
a bad one when it doesn't — wrong queries, slow responses, or off-topic answers in front
of reviewers are a real risk with an unconstrained agent. Scoping to known-good patterns
keeps the "wow" factor while removing the variance.

---

## 🔀 API Endpoints (High-Level)

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | public | Register donor/seeker/verifier |
| POST | `/api/auth/login` | public | JWT login |
| POST | `/api/devices` | DONOR | Create device listing |
| GET | `/api/devices` | all | Browse certified devices |
| POST | `/api/needs` | SEEKER | Create demand request |
| GET | `/api/needs/:id/matches` | SEEKER | See my top-3 matches |
| POST | `/api/matches/:id/accept` | SEEKER | Accept a match (transactional path) |
| POST | `/api/devices/:id/certify` | VERIFIER | Mark device SAFE / NOT_SAFE |
| POST | `/api/transfers` | ADMIN | Create transfer |
| POST | `/api/transfers/:id/feedback` | SEEKER | Rate + signal re-list intent |
| GET | `/api/reports/district-aggregate` | ADMIN | View-backed dashboard |
| POST | `/api/ai/ask` | authenticated | Ask the scoped NL→SQL assistant |

*(Full list of endpoints + request/response models in `docs/API.md`.)*

---

## 🖥️ Frontend Pages

1. **Login / Register** — role selection, accessible design
2. **Home / Discover** — browse certified available devices (map + list)
3. **Device Detail** — the digital ledger with certification + condition history
4. **Donor Dashboard** — list a device, track its status, trigger re-list
5. **Seeker Dashboard** — create a need, see top-3 matches, track transfer
6. **Verifier Portal** — certification queue, SAFE / NOT_SAFE verdicts
7. **Admin Panel** — counts, district aggregates (view), audit log
8. **AI Chat Assistant** — floating widget for the scoped NL→SQL queries

---

## 🗂️ Project Structure

```
divyasetu/
├── docker-compose.yml          # postgis/postgis + optional app services
├── .env.example                # shared template (never commit .env)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                 # ~80–120 realistic rows across Indian districts
├── server/
│   └── src/
│       ├── index.ts            # Express bootstrap
│       ├── routes/             # auth, devices, needs, verifier, matches, admin
│       ├── services/           # matching, transfers, access control
│       └── sql/                # trigger, procedure, view, window-fn scripts
├── ai-service/
│   ├── main.py                 # FastAPI
│   └── assistant.py            # LangChain NL→SQL agent, read-only DB role
├── client/
│   ├── src/pages/
│   ├── src/components/
│   └── tailwind.config.js
├── docs/
│   ├── ER-diagram/
│   ├── SQL-recipes/
│   └── demo-script.md
└── README.md
```

---

## 📅 20-Day Build Plan

Structured with a **mid-project buffer** — the original 4-week plan concentrated risk
in Week 3; this plan front-loads the highest-risk work and places a buffer immediately
after it, before starting the AI assistant.

### 🟢 Days 1–2 — Foundations
- **A:** Finalize Prisma schema (11 tables), write migration, start seed script
- **B:** Express skeleton, JWT auth, role guard middleware, `docker-compose.yml`
- **C:** React scaffold, Tailwind setup, routing, empty page shells for all 8 screens
- **DoD:** `docker compose up` works for everyone; API reachable; frontend shell navigable

### 🟢 Days 3–5 — CRUD verticals
- **A:** Seed data finalized (80–120 rows); start SQL recipes (trigger, procedure drafts)
- **B:** Device CRUD, Need CRUD, Certification endpoint
- **C:** Login/Register, Discover (list view), Donor + Seeker dashboards wired to real APIs
- **DoD:** donor lists a device, seeker posts a need, verifier certifies — all persisted, all visible in UI

### 🟠 Days 6–9 — The circulation loop (highest-risk block, front-loaded)
- **B:** PostGIS `ST_DWithin` radius query + scoring CTE + `ROW_NUMBER()` window function; then the `safe_match()` transaction with `SELECT … FOR UPDATE` row locking
- **A:** Trigger for `audit_log`; stored procedure `safe_to_transfer`; GiST index on geometry columns, B-tree on status/type_id
- **C:** Match results UI (top-3 cards), Accept flow, map view on Discover page
- **DoD:** full loop works end-to-end — list → certify → match → accept → transfer. **Explicitly test the double-claim race** (two seekers hit accept simultaneously) — this is the flagship demo moment.

### 🟡 Days 10–13 — AI Assistant (dedicated block, not squeezed into the end)
- **One member leads:** FastAPI service, LangChain few-shot setup against the 3–5 fixed query patterns, SELECT-only Postgres role, allowlist check before execution
- **Other two:** continue in parallel — begin Transfer status endpoints, Feedback endpoint, re-list logic, Verifier Portal + Admin Panel UI
- **DoD:** the 3–5 example questions reliably return correct results through the chat widget; write access is structurally blocked, not just prompt-blocked

### 🟢 Days 14–16 — Admin, transfers, feedback loop
- **B:** Transfer status endpoints, feedback endpoint, re-list logic (if not finished in the block above)
- **A:** Aggregation queries, district-aggregate view, full-text search on device descriptions
- **C:** Verifier Portal, Admin Panel, Transfer tracking UI, Feedback form

### 🔵 Days 17–18 — Integration pass
- Merge all branches, fix contract mismatches, re-seed clean data
- Walk the full happy path together as a team, at least twice, including the double-claim demo

### 🔵 Day 19 — Polish + docs
- ER diagram, SQL recipes doc, final README, demo script (scripted click-path, not improvised)
- Fix whatever breaks during dry-run demos

### ⚪ Day 20 — Slack
- Reserved, not pre-filled. Something breaks the day before a demo — this day exists to catch it.

> **Rule for this plan:** if Days 6–9 slip, the AI Assistant block (10–13) shrinks to
> absorb the overrun — not the integration pass or the slack day. The core loop is
> non-negotiable; the AI assistant's scope is the pressure valve.

---

## 👥 Team Workflow (3 Members)

| Member | Ownership | Files touched | Git branch |
|--------|-----------|---------------|------------|
| **A — Data & DB** | Prisma schema, migrations, seed, SQL recipes (trigger/procedure/view), indexes | `prisma/**`, `docs/**` | `feat/schema` |
| **B — Backend** | Express routes, auth, transactions, matching endpoints, AI service lead | `server/**`, `ai-service/**` | `feat/api` |
| **C — Frontend** | React pages, dashboards, match UI | `client/**` | `feat/frontend` |

**Git workflow**
- One `main` + 3 feature branches; PRs on `main`.
- Prisma migrations are committed → teammates just `git pull` + `docker compose up`.
- API contract (request/response shapes) agreed up front in `docs/API.md`.
- `.env.example` shared; real `.env` never committed.

> **Why Docker here:** it eliminates the #1 real-team risk — environment divergence
> between three machines — with a single `docker compose up`.

---

## ⚙️ Installation & Setup

> Prisma lives under `server/` (schema, migrations, seed, bootstrap all co-locate with the API).

```bash
# 1. Clone repo, copy env, install deps
git clone <repo-url> divyasetu
cd divyasetu
cp .env.example .env        # fill DATABASE_URL etc.
cd server && npm install

# 2. Start PostgreSQL 16 + PostGIS  (needs Docker Desktop / Docker Engine)
cd .. && docker compose up -d db

# 3. Enable PostGIS (no-op if the postgis image already enabled it), migrate, bootstrap, seed
cd server
npm run db:migrate          # prisma migrate dev  → creates the 11 tables
npm run db:bootstrap        # psql -f prisma/bootstrap.sql → PostGIS ext, GiST, triggers, proc, view
npm run db:seed             # prisma db seed → 24 devices / 10 needs in real districts

# 4. Start the backend
npm run dev                 # → http://localhost:4000  (see /api/health)

# 5. Start the AI service (separate terminal)
cd ../ai-service
uvicorn main:app --reload --port 8488

# 6. Start the frontend
cd ../client
npm run dev                 # → http://localhost:5173
```

> **Prerequisite:** Docker Desktop (Windows/WSL2) or Docker Engine (Linux/macOS).
> **Order matters:** migration → bootstrap → seed. `bootstrap.sql` adds the raw PostGIS
> layer (geometry indexes, audit/geometry triggers, stored function, aggregate view)
> that Prisma's schema cannot express, so run it before seeding.

---

## ✂️ Cut Scope — Why These Are Gone

Cutting these isn't a compromise — it's what makes a **finished** prototype possible
in 20 days instead of a partially-working one in 20+.

| Feature | Status | Why cut |
|---------|--------|---------|
| PostGIS + Docker | **Kept** | Core differentiator — locked in |
| Scoped AI assistant | **Kept, narrowed** | 3–5 fixed query patterns instead of a general agent — see [AI Assistant](#-ai-assistant--scoped-for-reliability) |
| Materialized view | Cut | A regular `VIEW` demonstrates the same concept with no refresh-staleness risk before a demo |
| Row-Level Security (RLS) | Cut | App-layer role guards give the same practical access control with far less risk of a silent misconfiguration |
| Progressive radius widening | Cut | Fixed radius still demonstrates `ST_DWithin` + GiST; widening adds branching logic, not a new concept |
| Multilingual IVR / USSD / SMS | Cut | OTP stubbed as a simple mobile code |
| Real courier / logistics integrations | Cut | Simulated via status updates |
| Cloudinary image uploads | Cut | Image URLs used in the demo |
| Native mobile app | Cut | Responsive web instead |
| AI description summarizer / photo damage flag | Cut | Optional stretch goals with no DBMS grading value |

---

## 📦 Deliverables

- Responsive web app (React + Tailwind)
- PostgreSQL + PostGIS schema (11 tables) demonstrating 14 load-bearing DBMS concepts
- REST API (25+ endpoints)
- Scoped natural-language → SQL AI assistant (read-only, structurally safe)
- ER diagram + SQL recipes (transaction, trigger, procedure, view, window function)
- Docker Compose reproducible dev environment
- This README + demo script + presentation deck

---

## 📄 License

This project is developed for educational purposes as part of a **Database Management
Systems (DBMS)** coursework.

```
MIT License — Copyright (c) 2026
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files...
```

---

<p align="center">
  <b>Built with ❤️ as a DBMS Project</b><br>
  <sub>React • Node.js • Express • PostgreSQL 16 + PostGIS • Prisma • Tailwind • FastAPI • LangChain</sub>
</p>

<p align="center">
  <sub>Last Updated: September 2026 — 20-day finished-prototype plan</sub>
</p>
