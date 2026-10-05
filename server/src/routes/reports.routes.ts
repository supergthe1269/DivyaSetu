import { Router } from "express";
import { prisma, rawQuery } from "../services/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/reports/district-aggregate — district supply × demand dashboard.
// Served by a SQL VIEW (see prisma/bootstrap.sql) that aggregates counts + nearest dist.
router.get("/district-aggregate", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    // Served by a SQL VIEW (prisma/bootstrap.sql) grouping available/delivered devices by category.
    const rows = await rawQuery<Record<string, unknown>>(
      `SELECT category, count_available::int AS count_available, count_delivered::int AS count_delivered FROM vw_district_aggregate ORDER BY category`
    );
    res.json({ rows });
  } catch (e) {
    next(e);
  }
});

// GET /api/reports/overview — headline counts for the admin panel.
router.get("/overview", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const [deviceCount, needCount, matched, delivered] = await Promise.all([
      prisma.device.count({ where: { isDeleted: false } }),
      prisma.need.count({}),
      prisma.match.count({ where: { status: "ACCEPTED" } }),
      prisma.transfer.count({ where: { status: "DELIVERED" } }),
    ]);
    res.json({ deviceCount, needCount, matched, delivered });
  } catch (e) {
    next(e);
  }
});

// GET /api/reports/audit-log — recent trust-ledger entries.
router.get("/audit-log", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    res.json({ rows });
  } catch (e) {
    next(e);
  }
});

export default router;