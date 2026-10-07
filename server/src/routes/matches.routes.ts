import { Router } from "express";
import { prisma, rawQuery } from "../services/db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { MATCH_CANDIDATES_SQL, MATCH_CANDIDATES_EXPANDED_SQL } from "../services/postgis.js";
import { config } from "../config/index.js";

const router = Router();

// POST /api/matches/generate  body: { needId }  → run PostGIS ranking and return enriched matches
router.post("/generate", requireAuth, async (req, res, next) => {
  try {
    const { needId, limit } = req.body ?? {};
    if (!needId) return next(Object.assign(new Error("needId is required"), { status: 400 }));
    const top = Number(limit ?? 5);

    // 1. First attempt: standard radius match (default 50km)
    let candidates = await rawQuery<{ device_id: number; need_id: number; dist_km: number; score: number }>(
      MATCH_CANDIDATES_SQL,
      [needId, config.defaultRadiusKm * 1000, top]
    );

    // 2. Fallback: if no devices found within local radius, expand nationwide
    if (candidates.length === 0) {
      candidates = await rawQuery<{ device_id: number; need_id: number; dist_km: number; score: number }>(
        MATCH_CANDIDATES_EXPANDED_SQL,
        [needId, top]
      );
    }

    // 3. Upsert candidates into matches table
    for (const c of candidates) {
      await prisma.match.upsert({
        where: { deviceId_needId: { deviceId: c.device_id, needId: c.need_id } },
        update: { score: c.score },
        create: {
          deviceId: c.device_id,
          needId: c.need_id,
          score: c.score,
          source: "GEO_SCORE",
          status: "PROPOSED",
        },
      });
    }

    // 4. Return all matches for this need with complete relations
    const matches = await prisma.match.findMany({
      where: { needId: Number(needId) },
      include: {
        device: {
          include: {
            type: true,
            donor: { select: { id: true, name: true, mobile: true } },
            certifications: { where: { verdict: "SAFE" }, take: 1 },
          },
        },
      },
      orderBy: { score: "desc" },
      take: top,
    });

    res.json({ matches, candidateCount: matches.length });
  } catch (e) {
    next(e);
  }
});

// GET /api/matches/for-need/:needId — retrieve existing matches for a need with full device details
router.get("/for-need/:needId", requireAuth, async (req, res, next) => {
  try {
    const needId = Number(req.params.needId);
    const matches = await prisma.match.findMany({
      where: { needId },
      include: {
        device: {
          include: {
            type: true,
            donor: { select: { id: true, name: true, mobile: true } },
            certifications: { where: { verdict: "SAFE" }, take: 1 },
          },
        },
      },
      orderBy: { score: "desc" },
    });
    res.json({ matches });
  } catch (e) {
    next(e);
  }
});

// POST /api/matches/:id/accept — THE flagship DBMS demo.
// A single ACID transaction with row-level locking: two seekers cannot both claim the same device.
router.post("/:id/accept", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const matchId = Number(req.params.id);
    const actorId = (req.user as any).id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock the match row (and thus the underlying device) FOR UPDATE.
      const locked = (await tx.$queryRawUnsafe(
        `SELECT id, device_id, need_id, status FROM matches WHERE id = ${matchId} FOR UPDATE`
      )) as Array<{ id: number; device_id: number; need_id: number; status: string }>;
      if (!locked.length) throw Object.assign(new Error("match not found"), { status: 404 });
      const m = locked[0];

      // 2. Lock the device row and verify it is still AVAILABLE.
      const dev = (await tx.$queryRawUnsafe(
        `SELECT id, status FROM devices WHERE id = ${m.device_id} FOR UPDATE`
      )) as Array<{ id: number; status: string }>;
      if (!dev.length || (dev[0] as any).status !== "AVAILABLE") {
        throw Object.assign(
          new Error("This device has already been claimed by someone else."),
          { status: 409 }
        );
      }

      // 3. Atomically mutate statuses.
      await tx.match.update({
        where: { id: m.id },
        data: { status: "ACCEPTED" },
      });
      await tx.device.update({
        where: { id: m.device_id },
        data: { status: "MATCHED" },
      });
      await tx.need.update({ where: { id: m.need_id }, data: { status: "MATCHED" } });
      await tx.auditLog.create({
        data: { tableName: "Match", recordId: m.id, action: "ACCEPT", actorId },
      });

      return { matchId: m.id, deviceId: m.device_id, needId: m.need_id, status: "ACCEPTED" };
    });

    res.json({ result });
  } catch (e) {
    next(e);
  }
});

export default router;