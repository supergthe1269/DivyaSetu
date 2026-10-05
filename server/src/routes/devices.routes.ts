import { Router } from "express";
import { prisma } from "../services/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { config } from "../config/index.js";

const router = Router();

// POST /api/devices — DONOR lists a new device (backfills geometry after insert)
router.post("/", requireAuth, requireRole("DONOR"), async (req: AuthedRequest, res, next) => {
  try {
    const uid = (req.user as any).id;
    const b = req.body ?? {};
    if (!b.serial || !b.typeId || !b.description) {
      return next(Object.assign(new Error("serial, typeId and description are required"), { status: 400 }));
    }
    const device = await prisma.device.create({
      data: {
        serial: b.serial,
        donorId: uid,
        typeId: b.typeId,
        condition: b.condition ?? "GOOD",
        description: b.description,
        lat: b.lat,
        lng: b.lng,
        status: "AVAILABLE",
      },
      include: { type: true },
    });

    // Backfill the PostGIS point (idempotent) for this device
    if (b.lat != null && b.lng != null) {
      await prisma.$executeRawUnsafe(
        `UPDATE devices SET geometry = ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geometry WHERE id = ${device.id}`
      );
    }
    await prisma.auditLog.create({
      data: { tableName: "Device", recordId: device.id, action: "LIST", actorId: uid },
    });
    res.status(201).json({ device });
  } catch (e) {
    next(e);
  }
});

// GET /api/devices — list certified, available devices.
//   ?lat= &lng= &radius= → returns nearest N within radius (km), PostGIS-ranked.
//   Otherwise returns the most recent available devices.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const radius = Number(req.query.radius ?? config.defaultRadiusKm);

    if (lat === null || lng === null) {
      const devices = await prisma.device.findMany({
        where: { status: "AVAILABLE", isDeleted: false, certifications: { some: { verdict: "SAFE" } } },
        include: { type: true },
        orderBy: { listedAt: "desc" },
        take: 50,
      });
      return res.json({ devices });
    }

    const rows = await prisma.$queryRawUnsafe(
      `SELECT d.id AS device_id, round((ST_Distance(n.geom, d.geometry) / 1000.0)::numeric, 1)::float AS dist_km
         FROM devices d
         CROSS JOIN (SELECT ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geometry AS geom) n
        WHERE d.status = 'AVAILABLE'
          AND d.is_deleted = false
          AND ST_DWithin(n.geom, d.geometry, ${radius}::float * 1000)
        ORDER BY dist_km ASC
        LIMIT 50`,
      undefined
    );
    const ids = (rows as { device_id: number }[]).map((r) => r.device_id);
    const devices = ids.length
      ? await prisma.device.findMany({ where: { id: { in: ids } }, include: { type: true } })
      : [];
    res.json({ devices, distancesKm: rows });
  } catch (e) {
    next(e);
  }
});

// GET /api/devices/:id/matches — top-N candidate needs for a device (mirrors need-side query).
router.get("/:id/matches", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const device = await prisma.device.findUnique({ where: { id }, include: { type: true } });
    if (!device) return next(Object.assign(new Error("device not found"), { status: 404 }));

    const rows = await prisma.$queryRawUnsafe(
      `WITH g AS (SELECT geometry AS g FROM devices WHERE id = ${id})
       SELECT n.id AS need_id, round((ST_Distance(g.g, n.geometry) / 1000.0)::numeric,1)::float AS dist_km
       FROM needs n CROSS JOIN g
       WHERE n.status = 'AVAILABLE' AND n.category = '${device.type.category}'
       ORDER BY (n.urgency_hours) ASC, dist_km ASC LIMIT 5`,
      undefined
    );
    res.json({ matches: rows });
  } catch (e) {
    next(e);
  }
});

export default router;