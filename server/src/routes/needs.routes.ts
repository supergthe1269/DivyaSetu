import { Router } from "express";
import { prisma } from "../services/db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/needs — SEEKER raises a demand request (backfills geometry).
router.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const b = req.body ?? {};
    // only a SEEKER (or ADMIN on behalf) may post a need
    if ((req.user as any).role !== "SEEKER" && (req.user as any).role !== "ADMIN") {
      return next(Object.assign(new Error("Forbidden"), { status: 403 }));
    }
    const need = await prisma.need.create({
      data: {
        seekerId: (req.user as any).id,
        category: b.category,
        urgencyHours: b.urgencyHours ?? 168,
        lat: b.lat,
        lng: b.lng,
        monthlyIncome: b.monthlyIncome,
        status: "AVAILABLE",
      },
    });
    if (b.lat != null && b.lng != null) {
      await prisma.$executeRawUnsafe(
        `UPDATE needs SET geometry = ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geometry WHERE id = ${need.id}`
      );
    }
    res.status(201).json({ need });
  } catch (e) {
    next(e);
  }
});

// GET /api/needs — list open needs (ADMIN/staff view).
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const needs = await prisma.need.findMany({
      where: { status: "AVAILABLE" },
      include: { seeker: { select: { name: true, mobile: true, disabilityType: true } } },
      orderBy: { urgencyHours: "asc" },
      take: 100,
    });
    res.json({ needs });
  } catch (e) {
    next(e);
  }
});

export default router;