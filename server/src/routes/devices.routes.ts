import { Router } from "express";
import { prisma } from "../services/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { config } from "../config/index.js";

const router = Router();

// POST /api/devices — DONOR lists a new device (routes to CERTIFYING queue & creates PENDING cert)
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
        imageUrl: b.imageUrl ?? null,
        status: "CERTIFYING", // awaiting verification
      },
      include: { type: true },
    });

    // Create an initial PENDING certification entry for verifiers
    const firstVerifier = await prisma.user.findFirst({ where: { role: "VERIFIER" } });
    if (firstVerifier) {
      await prisma.certification.create({
        data: {
          deviceId: device.id,
          verifierId: firstVerifier.id,
          verdict: "PENDING",
          notes: "Awaiting physical and mechanical safety inspection.",
          certificateRef: `PENDING-${device.id}`,
        },
      });
    }

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

// GET /api/devices/my — returns all devices owned by the authenticated donor in ANY lifecycle status
router.get("/my", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const uid = (req.user as any).id;
    const role = (req.user as any).role;
    const where = role === "ADMIN" ? { isDeleted: false } : { donorId: uid, isDeleted: false };

    const devices = await prisma.device.findMany({
      where,
      include: {
        type: true,
        certifications: { orderBy: { createdAt: "desc" } },
        matches: {
          include: {
            need: { select: { id: true, category: true, urgencyHours: true, lat: true, lng: true } },
            transfers: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { listedAt: "desc" },
    });
    res.json({ devices });
  } catch (e) {
    next(e);
  }
});

// GET /api/devices/pending-inspection — queue of devices awaiting verifier certification
router.get("/pending-inspection", requireAuth, requireRole("VERIFIER", "ADMIN"), async (_req, res, next) => {
  try {
    const devices = await prisma.device.findMany({
      where: {
        isDeleted: false,
        OR: [
          { status: "CERTIFYING" },
          { certifications: { none: { verdict: "SAFE" } } },
        ],
      },
      include: {
        type: true,
        donor: { select: { id: true, name: true, mobile: true, lat: true, lng: true } },
        certifications: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { listedAt: "desc" },
      take: 50,
    });
    res.json({ devices });
  } catch (e) {
    next(e);
  }
});

// GET /api/devices/track/:identifier — comprehensive lifecycle tracking & audit history for a device
router.get("/track/:identifier", requireAuth, async (req, res, next) => {
  try {
    const raw = String(req.params.identifier).trim();
    const isNum = /^\d+$/.test(raw);
    const where = isNum
      ? { id: Number(raw) }
      : { serial: { equals: raw, mode: "insensitive" as const } };

    const device = await prisma.device.findFirst({
      where,
      include: {
        type: true,
        donor: { select: { id: true, name: true, mobile: true, lat: true, lng: true } },
        certifications: {
          include: { verifier: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        matches: {
          include: {
            need: {
              include: {
                seeker: { select: { id: true, name: true, mobile: true, disabilityType: true } },
              },
            },
            transfers: {
              include: { feedback: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!device) {
      return next(Object.assign(new Error(`Device not found with serial/ID '${raw}'`), { status: 404 }));
    }

    // Retrieve full immutable audit history for this device
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { tableName: "Device", recordId: device.id },
          { tableName: "Certification", recordId: { in: device.certifications.map((c) => c.id) } },
        ],
      },
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    res.json({ device, auditLogs });
  } catch (e) {
    next(e);
  }
});

// GET /api/devices — list certified, available devices for Discover & Public exploration
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const radius = Number(req.query.radius ?? config.defaultRadiusKm);

    if (lat === null || lng === null) {
      const devices = await prisma.device.findMany({
        where: { status: "AVAILABLE", isDeleted: false, certifications: { some: { verdict: "SAFE" } } },
        include: { 
          type: true,
          certifications: { where: { verdict: "SAFE" }, take: 1 },
          donor: { select: { id: true, name: true } }
        },
        orderBy: { listedAt: "desc" },
        take: 50,
      });
      return res.json({ devices });
    }

    const rows = await prisma.$queryRawUnsafe(
      `SELECT d.id AS device_id, round((ST_Distance(n.geom::geography, d.geometry::geography) / 1000.0)::numeric, 1)::float AS dist_km
         FROM devices d
         CROSS JOIN (SELECT ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geometry AS geom) n
        WHERE d.status = 'AVAILABLE'
          AND d.is_deleted = false
          AND ST_DWithin(n.geom::geography, d.geometry::geography, ${radius}::float * 1000)
        ORDER BY dist_km ASC
        LIMIT 50`
    );
    const ids = (rows as { device_id: number; dist_km: number }[]).map((r) => r.device_id);
    const distMap = new Map((rows as any[]).map((r) => [r.device_id, r.dist_km]));

    const rawDevices = ids.length
      ? await prisma.device.findMany({ 
          where: { id: { in: ids } }, 
          include: { 
            type: true,
            certifications: { where: { verdict: "SAFE" }, take: 1 },
            donor: { select: { id: true, name: true } }
          } 
        })
      : [];

    const devices = rawDevices
      .map((d) => ({ ...d, distKm: distMap.get(d.id) }))
      .sort((a, b) => (distMap.get(a.id) ?? 0) - (distMap.get(b.id) ?? 0));

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
       SELECT n.id AS need_id, round((ST_Distance(g.g::geography, n.geometry::geography) / 1000.0)::numeric, 1)::float AS dist_km
       FROM needs n CROSS JOIN g
       WHERE n.status = 'AVAILABLE' AND n.category = '${device.type.category}'
       ORDER BY (n.urgency_hours) ASC, dist_km ASC LIMIT 5`
    );
    res.json({ matches: rows });
  } catch (e) {
    next(e);
  }
});

export default router;