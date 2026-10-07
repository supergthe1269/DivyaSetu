import { Router } from "express";
import { prisma } from "../services/db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/needs — SEEKER raises a demand request (backfills geometry).
router.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const b = req.body ?? {};
    const uid = (req.user as any).id;
    // only a SEEKER (or ADMIN on behalf) may post a need
    if ((req.user as any).role !== "SEEKER" && (req.user as any).role !== "ADMIN") {
      return next(Object.assign(new Error("Forbidden: only SEEKER can post a need"), { status: 403 }));
    }
    const need = await prisma.need.create({
      data: {
        seekerId: uid,
        category: b.category,
        urgencyHours: b.urgencyHours ?? 168,
        lat: b.lat,
        lng: b.lng,
        monthlyIncome: b.monthlyIncome,
        status: "AVAILABLE",
      },
      include: { seeker: { select: { name: true, mobile: true, disabilityType: true } } },
    });
    if (b.lat != null && b.lng != null) {
      await prisma.$executeRawUnsafe(
        `UPDATE needs SET geometry = ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geometry WHERE id = ${need.id}`
      );
    }
    await prisma.auditLog.create({
      data: { tableName: "Need", recordId: need.id, action: "REQUEST_NEED", actorId: uid },
    });
    res.status(201).json({ need });
  } catch (e) {
    next(e);
  }
});

// GET /api/needs/my — returns all demand requests belonging to the authenticated seeker
router.get("/my", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const uid = (req.user as any).id;
    const role = (req.user as any).role;
    const where = role === "ADMIN" ? {} : { seekerId: uid };

    const needs = await prisma.need.findMany({
      where,
      include: {
        seeker: { select: { id: true, name: true, mobile: true, disabilityType: true } },
        requests: {
          include: {
            device: {
              include: {
                type: true,
                donor: { select: { id: true, name: true, mobile: true } },
                certifications: { where: { verdict: "SAFE" }, take: 1 },
              },
            },
            transfers: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { score: "desc" },
        },
      },
      orderBy: { id: "desc" },
    });
    res.json({ needs });
  } catch (e) {
    next(e);
  }
});

// GET /api/needs/track/:id — lifecycle tracking for a specific need request
router.get("/track/:id", requireAuth, async (req, res, next) => {
  try {
    const needId = Number(req.params.id);
    const need = await prisma.need.findUnique({
      where: { id: needId },
      include: {
        seeker: { select: { id: true, name: true, mobile: true, disabilityType: true, lat: true, lng: true } },
        requests: {
          include: {
            device: {
              include: {
                type: true,
                donor: { select: { id: true, name: true, mobile: true } },
                certifications: { include: { verifier: { select: { name: true } } } },
              },
            },
            transfers: {
              include: { feedback: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { score: "desc" },
        },
      },
    });

    if (!need) {
      return next(Object.assign(new Error(`Need not found with ID ${needId}`), { status: 404 }));
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { tableName: "Need", recordId: need.id },
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ need, auditLogs });
  } catch (e) {
    next(e);
  }
});

// GET /api/needs — list all active demand requests
router.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const needs = await prisma.need.findMany({
      include: {
        seeker: { select: { id: true, name: true, mobile: true, disabilityType: true } },
        requests: {
          include: {
            device: { include: { type: true } },
            transfers: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { id: "desc" },
      take: 100,
    });
    res.json({ needs });
  } catch (e) {
    next(e);
  }
});

export default router;