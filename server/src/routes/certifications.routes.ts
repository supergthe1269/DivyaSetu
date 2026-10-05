import { Router } from "express";
import { prisma } from "../services/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import type { Verdict } from "@prisma/client";

const router = Router();

// POST /api/certifications  body: { deviceId, verdict, notes? }  — VERIFIER certifies a device.
router.post("/", requireAuth, requireRole("VERIFIER", "ADMIN"), async (req: AuthedRequest, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.deviceId || !["SAFE", "NOT_SAFE", "PENDING"].includes(b.verdict)) {
      return next(Object.assign(new Error("deviceId and a valid verdict are required"), { status: 400 }));
    }
    const device = await prisma.device.findUnique({ where: { id: b.deviceId } });
    if (!device) return next(Object.assign(new Error("device not found"), { status: 404 }));

    const certification = await prisma.certification.create({
      data: {
        deviceId: b.deviceId,
        verifierId: (req.user as any).id,
        verdict: b.verdict,
        notes: b.notes,
        certificateRef: b.certificateRef ?? `CERT-${Date.now()}`,
        inspectedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), // 1 year
      },
    });

    // Reflect verdict on the device status (SAFE → remains AVAILABLE; else back to CERTIFYING).
    const nextStatus = b.verdict === "SAFE" ? "AVAILABLE" : "CERTIFYING";
    await prisma.device.update({ where: { id: b.deviceId }, data: { status: nextStatus } });
    await prisma.auditLog.create({
      data: { tableName: "Certification", recordId: certification.id, action: b.verdict, actorId: (req.user as any).id },
    });

    res.status(201).json({ certification });
  } catch (e) {
    next(e);
  }
});

// GET /api/certifications?status=PENDING — the verifier work queue.
router.get("/", requireAuth, requireRole("VERIFIER", "ADMIN"), async (req, res, next) => {
  try {
    const verdict: Verdict | undefined = ["SAFE", "NOT_SAFE", "PENDING"].includes(String(req.query.status ?? "PENDING"))
    ? (String(req.query.status) as Verdict)
    : "PENDING";
  const rows = await prisma.certification.findMany({
      where: { verdict },
      include: { device: { include: { type: true, donor: { select: { name: true, mobile: true } } } }, verifier: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    res.json({ rows });
  } catch (e) {
    next(e);
  }
});

export default router;