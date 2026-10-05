# DivyaSetu — Evaluator Demo Script & Walkthrough
**Course**: BCSE302P Database Systems Lab  
**Evaluation**: 10 Marks Internal Review + 20 Marks Final Expo  
**Track**: T7 — Inclusion & Accessibility  

This scripted click-path guarantees that every examiner sees the end-to-end circulation loop and all 14 load-bearing DBMS concepts in under 7 minutes.

---

### Step 1: Donor Lists an Assistive Device (3NF + PostGIS Point)
1. Navigate to the top navigation bar and click the **Role: DONOR** quick-switcher button (or log in with `9000000001` / `pass1234`).
2. Go to **Donor Hub** (`/donor`).
3. Fill the **List an Assistive Device** form:
   - Category: `Standard Folding Wheelchair`
   - Condition: `EXCELLENT`
   - District: `Chennai — Vadapalani`
   - Description: `Lightweight aluminum folding wheelchair with dual handbrakes and padded seat.`
4. Click **Submit Device for Certification**.
5. *DBMS Concept Observed*: Trigger `trg_device_set_geometry` automatically computes `geometry = ST_SetSRID(ST_MakePoint(lng, lat), 4326)`. Trigger `trg_audit_device_status` appends a row to `audit_log`.

---

### Step 2: Verifier Certifies the Equipment (Stored Function + Trust Ledger)
1. Click the **Role: VERIFIER** quick-switcher button in the navbar (or log in with `9200000001` / `pass1234`).
2. Go to **Verifier Portal** (`/verifier`).
3. Select the newly listed device from the left queue.
4. Select Verdict: **SAFE FOR USE (Certified)**.
5. In notes, enter: `Full mechanical check passed; wheels aligned, brakes verified.`
6. Click **Issue Safety Certificate**.
7. *DBMS Concept Observed*: Device is marked `AVAILABLE`. Stored function `fn_device_is_certified(device_id)` now evaluates to `TRUE`. The cryptographic certificate is linked to `certifications`.

---

### Step 3: Seeker Posts Urgent Demand & Runs PostGIS Matching
1. Click the **Role: SEEKER** quick-switcher button (or log in with `9100000001` / `pass1234`).
2. Go to **Seeker Hub** (`/seeker`).
3. View existing needs or create a new urgent need:
   - Equipment: `Standard Folding Wheelchair`
   - Urgency Window: `12 hrs (Critical post-injury)`
   - Beneficiary Location: `Chennai — Mylapore`
4. Click **Post Urgent Need Request**.
5. Under **Top Match Proposals**, click **Re-rank Matches**.
6. *DBMS Concept Observed*: The backend runs `MATCH_CANDIDATES_SQL` using PostGIS `ST_DWithin` on the GiST index, weighting distance (60%), urgency (30%), and condition (10%) with window ranking `DENSE_RANK()`.

---

### Step 4: Flagship Demo — ACID Row-Level Locking (`SELECT FOR UPDATE`)
1. In the Seeker Hub, locate candidate **Device #1**.
2. Click **Claim Device (ACID)**.
3. *DBMS Concept Observed*:
   - The transaction executes:
     ```sql
     SELECT id, status FROM matches WHERE id = :matchId FOR UPDATE;
     SELECT id, status FROM devices WHERE id = :deviceId FOR UPDATE;
     ```
   - Device status is atomically flipped to `MATCHED`.
   - If a second user concurrently attempts to claim the same device, the row lock forces serialization, and the second attempt is rejected with an HTTP 409 Conflict: *"This device has already been claimed by someone else."*

---

### Step 5: Admin Dispatches Handover & Triggers Circular Reuse Loop
1. Click the **Role: ADMIN** quick-switcher button (or log in with `9300000001` / `pass1234`).
2. Go to **Admin Panel** (`/admin`).
3. Observe the **SQL View: vw_district_aggregate** table updating live supply and delivery counts across categories.
4. Under **Transfer Dispatcher**, enter the accepted match ID and click **Dispatch Device Handover**.
5. Device transitions to `IN_TRANSIT`.
6. When marked delivered with seeker feedback indicating `reListIntent: true`, the device transitions to `RE_LISTED`, ready to serve the next beneficiary!

---

### Step 6: Scoped AI Assistant (FastAPI + Read-Only Postgres Role)
1. Click the purple **AI Query** button in the top navbar.
2. In the AI drawer, click one of the preset evaluation questions:
   - *"Show me certified wheelchairs available within 50 km of Chennai."*
   - *"Top 10 urgent needs in Tamil Nadu that are still unmatched."*
   - *"What is the supply vs demand count per device category?"*
3. Observe:
   - The generated PostGIS SQL query.
   - The explanation of spatial filtering.
   - The tabular results returned through the dedicated `SELECT-only` database role.
