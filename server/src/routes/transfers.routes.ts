import { Router } from "express";
import { prisma } from "../services/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/transfers  body: { matchId, pickupAddr, dropoffAddr }  — ADMIN creates the handover.
router.post("/", requireAuth, requireRole("ADMIN"), async (req: AuthedRequest, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.matchId || !b.pickupAddr || !b.dropoffAddr) {
      return next(Object.assign(new Error("matchId, pickupAddr and dropoffAddr are required"), { status: 400 }));
    }
    const match = await prisma.match.findUnique({ where: { id: b.matchId } });
    if (!match || match.status !== "ACCEPTED") {
      return next(Object.assign(new Error("transfer requires an ACCEPTED match"), { status: 400 }));
    }
    const transfer = await prisma.transfer.create({
      data: { matchId: b.matchId, pickupAddr: b.pickupAddr, dropoffAddr: b.dropoffAddr, status: "PLANNED", costPaisa: b.costPaisa },
    });
    await prisma.device.update({ where: { id: match.deviceId }, data: { status: "IN_TRANSIT" } });
    res.status(201).json({ transfer });
  } catch (e) {
    next(e);
  }
});

// POST /api/transfers/:id/deliver  — mark delivered; device → DELIVERED.
router.post("/:id/deliver", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const transfer = await prisma.transfer.findUnique({ where: { id: Number(req.params.id) }, include: { match: true } });
    if (!transfer) return next(Object.assign(new Error("transfer not found"), { status: 404 }));
    await prisma.transfer.update({ where: { id: transfer.id }, data: { status: "DELIVERED", deliveredAt: new Date() } });
    await prisma.device.update({ where: { id: transfer.match.deviceId }, data: { status: "DELIVERED" } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/transfers/:id/feedback  body: { rating, notes?, reListIntent? }
// Feedback can re-list a device → the reuse cycle (DEVICE → RE_LISTED at the seeking end).
router.post("/:id/feedback", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const b = req.body ?? {};
    const transfer = await prisma.transfer.findUnique({
      where: { id: Number(req.params.id) },
      include: { match: true },
    });
    if (!transfer) return next(Object.assign(new Error("transfer not found"), { status: 404 }));

    const feedback = await prisma.feedback.create({
      data: { transferId: transfer.id, rating: b.rating ?? 5, notes: b.notes, reListIntent: b.reListIntent ?? false },
    });

    if (b.reListIntent) {
      await prisma.device.update({
        where: { id: transfer.match.deviceId },
        data: { status: "RE_LISTED", lat: null, lng: null },
      });
      await prisma.auditLog.create({
        data: { tableName: "Device", recordId: transfer.match.deviceId, action: "RE_LIST", actorId: (req.user as any).id },
      });
    }
    res.status(201).json({ feedback });
  } catch (e) {
    next(e);
  }
});

export default router;