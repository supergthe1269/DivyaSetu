// PostGIS + full-text helpers used across the services and seed.

/** PostGIS literal that turns (lng, lat) into a 4326 Point. */
export function pointSql(lng: number, lat: number): string {
  return `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geometry`;
}

/** Bind a device row's geometry from its lat/lng columns. */
export const SET_DEVICE_GEOMETRY_SQL = `
UPDATE devices
SET geometry = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geometry
WHERE id = ANY($1::int[])
`;

/** Bind a need row's geometry from its lat/lng columns. */
export const SET_NEED_GEOMETRY_SQL = `
UPDATE needs
SET geometry = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geometry
WHERE id = ANY($1::int[])
`;

/**
 * Radius matching query (PostGIS). Returns top-N candidate devices for a need.
 *  - Filters by category and status, then by ST_DWithin radius (km).
 *  - Ranks with DENSE_RANK() OVER (ORDER BY score DESC, dist_km ASC)
 *    and a weighted score: distance dominates, urgency nudges.
 *  - Requires an eligible need (not yet fulfilled).
 */
export const MATCH_CANDIDATES_SQL = `
WITH geo AS (
  SELECT id AS need_id, geometry AS need_geom, category AS need_cat, urgency_hours
  FROM needs
  WHERE id = $1::int
),
candidates AS (
  SELECT
    d.id                                              AS device_id,
    n.need_id                                         AS need_id,
    n.urgency_hours,
    ST_Distance(n.need_geom, d.geometry) / 1000.0     AS dist_km,   -- metres -> km
    0.6 * (1.0 - least(ST_Distance(n.need_geom, d.geometry) / 1000.0 / ($2::float / 1000.0), 1.0))
      + 0.3 * (1.0 - exp(-n.urgency_hours::float / 168.0))
      + 0.1 * CASE WHEN d.condition = 'EXCELLENT' THEN 1.0 ELSE 0.5 END AS score
  FROM geo n
  CROSS JOIN devices d
  WHERE d.status = 'AVAILABLE'
    AND d.type_id = (SELECT id FROM device_types WHERE category = n.need_cat)
    AND d.is_deleted = false
    AND ST_DWithin(n.need_geom, d.geometry, $2::float)  -- radius in metres
),
ranked AS (
  SELECT *, DENSE_RANK() OVER (ORDER BY score DESC, dist_km ASC) AS rnk
  FROM candidates
)
SELECT device_id, need_id, round(dist_km::numeric, 1)::float AS dist_km, round(score::numeric, 3)::float AS score
FROM ranked
WHERE rnk <= $3::int
ORDER BY score DESC, dist_km ASC
`;

/** Fallback query if no devices exist within the local radius: matches closest nationwide. */
export const MATCH_CANDIDATES_EXPANDED_SQL = `
WITH geo AS (
  SELECT id AS need_id, geometry AS need_geom, category AS need_cat, urgency_hours
  FROM needs
  WHERE id = $1::int
),
candidates AS (
  SELECT
    d.id                                              AS device_id,
    n.need_id                                         AS need_id,
    n.urgency_hours,
    ST_Distance(n.need_geom, d.geometry) / 1000.0     AS dist_km,
    0.6 * (1.0 - least(ST_Distance(n.need_geom, d.geometry) / 1000.0 / 2500.0, 1.0))
      + 0.3 * (1.0 - exp(-n.urgency_hours::float / 168.0))
      + 0.1 * CASE WHEN d.condition = 'EXCELLENT' THEN 1.0 ELSE 0.5 END AS score
  FROM geo n
  CROSS JOIN devices d
  WHERE d.status = 'AVAILABLE'
    AND d.type_id = (SELECT id FROM device_types WHERE category = n.need_cat)
    AND d.is_deleted = false
),
ranked AS (
  SELECT *, DENSE_RANK() OVER (ORDER BY score DESC, dist_km ASC) AS rnk
  FROM candidates
)
SELECT device_id, need_id, round(dist_km::numeric, 1)::float AS dist_km, round(score::numeric, 3)::float AS score
FROM ranked
WHERE rnk <= $2::int
ORDER BY score DESC, dist_km ASC
`;