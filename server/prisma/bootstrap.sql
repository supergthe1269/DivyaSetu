-- ============================================================
-- DivyaSetu bootstrap.sql  (PostGIS + DBMS raw SQL layer)
-- Run once AFTER `prisma migrate dev` and BEFORE seeding:
--   psql "$DATABASE_URL" -f bootstrap.sql
-- (If PostGIS is already enabled by the postgis/postgis image, the
--  CREATE EXTENSION below is a no-op.)
--
-- This file delivers the pieces Prisma/PG cannot express via the
-- schema: GiST geo-indexes, auto-maintained geometry, an audit
-- trigger, a stored function, and an aggregate view.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------- GiST geospatial indexes ----------
CREATE INDEX IF NOT EXISTS idx_devices_geometry_gist
  ON devices USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_needs_geometry_gist
  ON needs USING GIST (geometry);

-- ---------- Trigger: keep geometry in sync with lat/lng ----------
-- On any insert/update to a device, recompute the PostGIS point from
-- the ORM-facing lat/lng columns so matching queries stay correct.
CREATE OR REPLACE FUNCTION fn_device_set_geometry() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geometry := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geometry;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_device_set_geometry ON devices;
CREATE TRIGGER trg_device_set_geometry
  BEFORE INSERT OR UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION fn_device_set_geometry();

CREATE OR REPLACE FUNCTION fn_need_set_geometry() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geometry := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geometry;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_need_set_geometry ON needs;
CREATE TRIGGER trg_need_set_geometry
  BEFORE INSERT OR UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION fn_need_set_geometry();

-- ---------- Trigger: audit device status changes ----------
-- Appends to audit_log (the trust ledger) whenever a device changes status.
CREATE OR REPLACE FUNCTION fn_audit_device_status() RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_log(table_name, record_id, action, payload, actor_id, created_at)
    VALUES ('devices', NEW.id, 'STATUS_CHANGE',
            jsonb_build_object('from', OLD.status, 'to', NEW.status),
            NEW.donor_id, now());
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_device_status ON devices;
CREATE TRIGGER trg_audit_device_status
  AFTER INSERT OR UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION fn_audit_device_status();

-- ---------- Stored function: is a device currently certified SAFE ? ----------
-- Used to reason about transfer-worthiness without duplicating logic in app code.
CREATE OR REPLACE FUNCTION fn_device_is_certified(p_device_id integer)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM certifications c
    WHERE c.device_id = p_device_id
      AND c.verdict = 'SAFE'
      AND (c.expires_at IS NULL OR c.expires_at > now())
  );
END; $$ LANGUAGE plpgsql;

-- ---------- View: category-wise device supply summary ----------
-- Groups available/delivered devices by device-type category.
CREATE OR REPLACE VIEW vw_district_aggregate AS
SELECT dt.category,
       COUNT(d.id) FILTER (WHERE d.status = 'AVAILABLE') AS count_available,
       COUNT(d.id) FILTER (WHERE d.status = 'DELIVERED') AS count_delivered
FROM devices d
JOIN device_types dt ON d.type_id = dt.id
GROUP BY dt.category;