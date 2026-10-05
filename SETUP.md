# DivyaSetu (दिव्यसेतु) — Complete Team Setup & Execution Guide

This guide provides a comprehensive, step-by-step procedure for team members to set up, initialize, and run the entire **DivyaSetu** platform locally from scratch.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your operating system:

| Software | Minimum Version | Verification Command |
|----------|-----------------|----------------------|
| **Git** | Any recent | `git --version` |
| **Node.js** | v18.0.0+ (v20+ recommended) | `node -v` |
| **npm** | v9.0.0+ | `npm -v` |
| **Python** | 3.10+ (3.11 recommended) | `python --version` |
| **Docker Desktop** | Latest (Windows / macOS / Linux) | `docker --version` |

> **Note on Database**: DivyaSetu uses **PostgreSQL 16 + PostGIS 3** for geospatial queries. Docker Desktop is the easiest method since `docker-compose.yml` configures PostgreSQL and PostGIS automatically without manual installation.

---

## 2. Clone the Repository & Configure Environment

1. Open your terminal (PowerShell, Command Prompt, or Bash) and clone the repository:
   ```bash
   git clone https://github.com/supergthe1269/DivyaSetu.git
   cd DivyaSetu
   ```

2. Create your local `.env` file from the provided template:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On macOS / Linux:
     ```bash
     cp .env.example .env
     ```

3. Also ensure `server/.env` exists (the server loads its environment from `server/.env` or root):
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example server\.env
     ```
   - On macOS / Linux:
     ```bash
     cp .env.example server/.env
     ```

4. The default `.env` contents are pre-configured to match the Docker container:
   ```env
   DATABASE_URL="postgresql://divyasetu:divyasetu@localhost:5432/divyasetu?schema=public"
   PORT=4000
   JWT_SECRET="divyasetu-jwt-super-secret-dev-key-change-in-prod"
   AI_SERVICE_URL="http://localhost:8488"
   CLIENT_URL="http://localhost:5173"
   ```

---

## 3. Start the Database (PostgreSQL + PostGIS)

Run the following command from the root directory of the project:

```bash
docker compose up -d db
```

To verify the database container is active:
```bash
docker ps
```
You should see a container named `divyasetu-db` running with port `5432->5432`.

---

## 4. Initialize Database Schema, Triggers & Seed Data

Navigate into the `server` directory to install dependencies and populate the database:

```bash
cd server
npm install
```

Run these three database commands in exact order:

```bash
# 1. Apply Prisma migrations (creates the 11 relational tables)
npm run db:migrate

# 2. Bootstrap PostGIS extensions, spatial GiST indexes, PL/pgSQL triggers, and SQL views
npm run db:bootstrap

# 3. Seed realistic Indian demographic data (24 devices, 29 needs, 4 verified roles)
npm run db:seed
```

> **Why step 2 is essential**: `bootstrap` installs the PostGIS spatial engine, coordinates-to-geometry auto-generation triggers, the row-locking verification procedure, and the `vw_district_aggregate` analytics view that Prisma cannot generate automatically.

---

## 5. Run the Application Services

To test the full system, open **3 separate terminal windows**:

### Terminal 1: Backend API Gateway (Express)
```bash
cd DivyaSetu/server
npm run dev
```
*Expected Output:*
```text
[divyasetu-server] API running on http://localhost:4000 (env: development)
[divyasetu-server] Connected to PostgreSQL + PostGIS database.
```
*Health Check URL:* [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

### Terminal 2: AI Query Engine (FastAPI)
```bash
cd DivyaSetu/ai-service

# (Recommended) Create and activate a Python virtual environment:
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --port 8488 --reload
```
*Expected Output:*
```text
INFO:     Uvicorn running on http://0.0.0.0:8488
INFO:     Application startup complete.
```
*Health Check URL:* [http://localhost:8488/health](http://localhost:8488/health)

---

### Terminal 3: Frontend Web Client (React + Vite)
```bash
cd DivyaSetu/client
npm install
npm run dev
```
*Expected Output:*
```text
  VITE v5.4.21  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the application.

---

## 6. Run the Automated Test Suite

To verify that all services and database connections are working properly on your machine, open a terminal in `server/` and run:

```bash
cd server
npm test
```

This runs the live integration test suite validating:
- Express API Gateway health
- FastAPI AI service health
- Authentication & JWT token generation across all 4 roles
- PostGIS spatial device queries
- Seeker needs and top-3 matching algorithm
- District aggregate SQL analytics view
- Natural Language to SQL generation

**Expected Output:**
```text
=======================================================
          DIVYASETU INTEGRATION TEST SUITE            
=======================================================

[PASS] Express API Health Check (/api/health)
[PASS] FastAPI AI Service Health Check (/health)
[PASS] Authentication: Donor Login (9000000001)
[PASS] Authentication: Seeker Login (9100000001)
[PASS] Authentication: Verifier Login (9200000001)
[PASS] Authentication: Admin Login (9300000001)
[PASS] Devices Feed with PostGIS Geo-Points (/api/devices)
[PASS] Beneficiary Needs Feed (/api/needs)
[PASS] DBMS View: District Supply-Demand Aggregation (/api/reports/district-aggregate)
[PASS] AI Service: Scoped NL->SQL Query Execution (/ask)

-------------------------------------------------------
Summary: 10/10 test suites passing (100%)
-------------------------------------------------------
```

---

## 7. Demo Accounts & Credentials

The seed script initializes accounts for each user role with the password **`pass1234`**:

| Role | Mobile Number | Password | Key Workflows to Explore |
|------|---------------|----------|--------------------------|
| **Donor** | `9000000001` | `pass1234` | List pre-owned assistive devices, specify condition, view live inspection status. |
| **Seeker** | `9100000001` | `pass1234` | Submit urgent accessibility requests, see top-3 PostGIS ranked matches, claim devices. |
| **Verifier** | `9200000001` | `pass1234` | Technical inspection queue, evaluate safety standards, assign `SAFE` / `NOT_SAFE` verdicts. |
| **Admin** | `9300000001` | `pass1234` | District-wide supply vs demand analytics (SQL View), dispatch logistics, inspect immutable audit log. |

---

## 8. Common Troubleshooting

### Issue 1: "Port 5432 is already in use"
- **Cause**: A local instance of PostgreSQL is already running on your machine.
- **Solution**: Either stop your local PostgreSQL service (`net stop postgresql` on Windows or `sudo systemctl stop postgresql` on Linux) OR modify the port in `docker-compose.yml` to `5433:5432` and update `DATABASE_URL` in `.env`.

### Issue 2: `npm run db:bootstrap` fails with "psql: command not found" or connection error
- **Cause**: `bootstrap.ts` connects via the Node `pg` client using `DATABASE_URL`.
- **Solution**: Ensure your database container is up (`docker compose up -d db`) and that the credentials in `server/.env` match `postgresql://divyasetu:divyasetu@localhost:5432/divyasetu?schema=public`.

### Issue 3: AI Service throws database connection error
- **Cause**: The Python service loads `DATABASE_URL` from `.env`.
- **Solution**: Ensure `.env` exists in the project root or in `ai-service/.env`.

### Issue 4: Frontend displays blank map
- **Cause**: Leaflet tiles require internet access to load OpenStreetMap tiles.
- **Solution**: Ensure your machine has an active internet connection to render map tiles.
