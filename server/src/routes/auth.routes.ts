import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../services/db.js";
import { signToken, loadUser } from "../services/token.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import type { Role } from "@prisma/client";

const router = Router();

const VALID_ROLES: Role[] = ["DONOR", "SEEKER", "VERIFIER", "ADMIN"];

interface RegisterBody {
  name: string;
  mobile: string;
  password: string;
  role?: Role;
  language?: string;
  disabilityType?: string;
}

function bad(next: any, msg: string) {
  return next(Object.assign(new Error(msg), { status: 400 }));
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const b = req.body as RegisterBody;
    if (!b?.name || !b?.mobile || !b?.password) return bad(next, "name, mobile and password are required");
    const role: Role = b.role && VALID_ROLES.includes(b.role) ? b.role : "DONOR";
    const exists = await prisma.user.findUnique({ where: { mobile: b.mobile } });
    if (exists) return bad(next, "mobile already registered");

    const passwordHash = bcrypt.hashSync(b.password, 10);
    const user = await prisma.user.create({
      data: {
        name: b.name,
        mobile: b.mobile,
        passwordHash,
        role,
        language: b.language ?? "en",
        disabilityType: b.disabilityType,
      },
      select: { id: true, role: true },
    });
    await prisma.auditLog.create({
      data: { tableName: "User", recordId: user.id, action: "REGISTER", actorId: user.id, payload: { role } },
    });
    res.status(201).json({ user: { id: user.id, role }, token: signToken(user.id, role) });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { mobile, password } = req.body ?? {};
    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user || user.isDeleted || !bcrypt.compareSync(password ?? "", user.passwordHash)) {
      return bad(next, "invalid credentials");
    }
    res.json({ user: { id: user.id, mobile, role: user.role, name: user.name }, token: signToken(user.id, user.role) });
  } catch (e) {
    next(e);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    res.json({ user: await loadUser((req.user as any).id) });
  } catch (e) {
    next(e);
  }
});

export default router;