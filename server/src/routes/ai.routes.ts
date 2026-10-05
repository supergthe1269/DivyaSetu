import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { config } from "../config/index.js";

const router = Router();

// POST /api/ai/ask — proxy to the FastAPI NL→SQL assistant.
// Kept as a thin proxy so the Express layer owns auth; the AI service is
// read-only (SELECT-only Postgres role) and applies its own query allowlist.
router.post("/ask", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { question } = req.body ?? {};
    if (!question || typeof question !== "string") {
      return next(Object.assign(new Error("question is required"), { status: 400 }));
    }
    // Referer copy of auth for the AI service audit log (no secret forwarded).
    const resp = await fetch(`${config.aiServiceUrl}/ask`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, requestedBy: (req.user as any).id }),
    });
    if (!resp.ok) {
      return next(Object.assign(new Error("AI service error"), { status: 502 }));
    }
    res.json(await resp.json());
  } catch (e) {
    next(e);
  }
});

export default router;