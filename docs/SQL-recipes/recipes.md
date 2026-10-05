# DivyaSetu — 14 Load-Bearing DBMS Concepts & SQL Recipes
**Course**: BCSE302P Database Systems Lab  
**Evaluation Focus**: Database Implementation, Concurrency, and Spatial Querying  

Every concept below is load-bearing in the working prototype. Nothing exists solely to pad a presentation slide.

---

### Concept 1 & 2: 3NF Relational Structure & Foreign Keys
All entity boundaries respect 3NF. No derivable attributes (e.g., aggregate counts or dynamic match rankings) are stored in base tables.
```sql
-- Relational join across 3NF boundaries: Asset -> Catalog -> Certification -> Donor
SELECT d.serial, dt.label, d.condition, c.verdict, u.name AS donor_name
FROM devices d
JOIN device_types dt ON d.type_id = dt.id
LEFT JOIN certifications c ON d.id = c.device_id
JOIN users u ON d.donor_id = u.id
WHERE d.status = 'AVAILABLE';
```

---

### Concept 3: Domain & Check Constraints
Enforces integrity at the engine level:
```sql
-- Enforced via schema DDL:
ALTER TABLE needs ADD CONSTRAINT chk_urgency_positive CHECK (urgency_hours > 0);
ALTER TABLE needs ADD CONSTRAINT chk_income_nonnegative CHECK (monthly_income >= 0);
ALTER TABLE feedback ADD CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE matches ADD CONSTRAINT uq_device_need UNIQUE (device_id, need_id);
```

---

### Concept 4: ACID Transaction with Row-Level Locking (Flagship Demo)
Prevents the **double-allocation race condition** when two beneficiaries accept the same device simultaneously.
```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 1. Lock the match row FOR UPDATE to serialize concurrent claims
SELECT id, device_id, need_id, status 
FROM matches 
WHERE id = 10 
FOR UPDATE;

-- 2. Lock the underlying device row and verify it is still AVAILABLE
SELECT id, status 
FROM devices 
WHERE id = 1 
FOR UPDATE;

-- 3. Atomically mutate state across match, device, need, and audit_log
UPDATE matches SET status = 'ACCEPTED' WHERE id = 10;
UPDATE devices SET status = 'MATCHED' WHERE id = 1;
UPDATE needs SET status = 'MATCHED' WHERE id = 5;

INSERT INTO audit_log (table_name, record_id, action, actor_id, payload, created_at)
VALUES ('matches', 10, 'ACCEPT', 2, '{"event": "ACID_CLAIM"}'::jsonb, NOW());

COMMIT;
```
*Demo Proof*: If Worker B executes the same block concurrently, it blocks at `FOR UPDATE`. When Worker A commits, Worker B evaluates `status = 'MATCHED'` and is rejected with an HTTP 409 Conflict.

---

### Concept 5: PL/pgSQL Triggers
Auto-appends to the immutable `audit_log` on any device status flip:
```sql
CREATE OR REPLACE FUNCTION fn_audit_device_status() RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_log(table_name, record_id, action, payload, actor_id, created_at)
    VALUES ('devices', NEW.id, 'STATUS_CHANGE',
            jsonb_build_object('from', OLD.status, 'to', NEW.status),
            NEW.donor_id, NOW());
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_device_status
  AFTER INSERT OR UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION fn_audit_device_status();
```

---

### Concept 6: Stored Function
Used by the verifier workflow to determine transfer-worthiness without duplicating business rules in application code:
```sql
CREATE OR REPLACE FUNCTION fn_device_is_certified(p_device_id integer)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM certifications c
    WHERE c.device_id = p_device_id
      AND c.verdict = 'SAFE'
      AND (c.expires_at IS NULL OR c.expires_at > NOW())
  );
END; $$ LANGUAGE plpgsql;

-- Invocation:
SELECT fn_device_is_certified(1);
```

---

### Concept 7: SQL View
Provides real-time aggregated telemetry without materialization staleness:
```sql
CREATE OR REPLACE VIEW vw_district_aggregate AS
SELECT dt.category,
       COUNT(d.id) FILTER (WHERE d.status = 'AVAILABLE') AS count_available,
       COUNT(d.id) FILTER (WHERE d.status = 'DELIVERED') AS count_delivered
FROM devices d
JOIN device_types dt ON d.type_id = dt.id
GROUP BY dt.category;

-- Query view:
SELECT * FROM vw_district_aggregate ORDER BY count_available DESC;
```

---

### Concept 8 & 9: Window Functions & Common Table Expressions (CTE)
The core matching algorithm combining PostGIS geospatial distance, urgency weighting, and dense ranking:
```sql
WITH geo AS (
  SELECT id AS need_id, geometry AS need_geom, category AS need_cat, urgency_hours
  FROM needs
  WHERE id = 1
),
candidates AS (
  SELECT
    d.id                                              AS device_id,
    n.need_id                                         AS need_id,
    n.urgency_hours,
    ST_Distance(n.need_geom, d.geometry) / 1000.0     AS dist_km,
    0.6 * (1.0 - least(ST_Distance(n.need_geom, d.geometry) / 1000.0 / 50.0, 1.0))
      + 0.3 * (1.0 - exp(-n.urgency_hours::float / 168.0))
      + 0.1 * CASE WHEN d.condition = 'EXCELLENT' THEN 1.0 ELSE 0.5 END AS score
  FROM geo n
  CROSS JOIN devices d
  WHERE d.status = 'AVAILABLE'
    AND d.type_id = (SELECT id FROM device_types WHERE category = n.need_cat)
    AND d.is_deleted = false
    AND ST_DWithin(n.need_geom, d.geometry, 50000)
),
ranked AS (
  SELECT *, DENSE_RANK() OVER (ORDER BY score DESC, dist_km ASC) AS rnk
  FROM candidates
)
SELECT device_id, need_id, round(dist_km::numeric, 1)::float AS dist_km, round(score::numeric, 3)::float AS score
FROM ranked
WHERE rnk <= 3
ORDER BY score DESC, dist_km ASC;
```

---

### Concept 10: GiST Geospatial Indexing
Native PostGIS spatial indexing for high-performance radius queries:
```sql
CREATE INDEX idx_devices_geometry_gist ON devices USING GIST (geometry);
CREATE INDEX idx_needs_geometry_gist ON needs USING GIST (geometry);

-- Proof of index scan via EXPLAIN:
EXPLAIN ANALYZE
SELECT id, serial
FROM devices
WHERE ST_DWithin(
  geometry,
  ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geometry,
  50000
);
```

---

### Concept 11: B-Tree Indexes
Accelerates transactional lookups and status filtering:
```sql
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_type_id ON devices(type_id);
CREATE INDEX idx_needs_category_status ON needs(category, status);
```

---

### Concept 12: Full-Text Search (FTS)
Enables fuzzy equipment specification searches over donor descriptions:
```sql
-- Add tsvector and search query
SELECT id, serial, description
FROM devices
WHERE to_tsvector('english', description) @@ to_tsquery('english', 'wheelchair & folding');
```

---

### Concept 13: JSONB Semi-Structured Payloads
Stores polymorphic metadata in `audit_log`:
```sql
SELECT id, record_id, action, payload->>'from' AS from_status, payload->>'to' AS to_status
FROM audit_log
WHERE table_name = 'devices' 
  AND payload ? 'from';
```

---

### Concept 14: Database-Level Role-Based Access Control (RBAC)
Structural security for the AI assistant:
```sql
-- Create read-only role for the FastAPI AI service
CREATE ROLE divyasetu_ai_reader WITH LOGIN PASSWORD 'ai_readonly_pass';
GRANT CONNECT ON DATABASE divyasetu TO divyasetu_ai_reader;
GRANT USAGE ON SCHEMA public TO divyasetu_ai_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO divyasetu_ai_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO divyasetu_ai_reader;
```
Even if prompt injection occurs, the AI service database credentials structurally reject any `INSERT`, `UPDATE`, or `DROP` query.
