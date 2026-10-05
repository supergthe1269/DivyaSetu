import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/token.js";
import { prisma } from "../services/db.js";
import type { Role } from "@prisma/client";

export interface AuthUser {
  id: number;
  name: string;
  mobile: string;
  role: Role;
  language: string;
  isApproved: boolean;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

/** Attaches req.user when a valid Bearer token is present. Throws 401 otherwise. */
export async function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) throw new Error("missing token");

    const payload = verifyToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isDeleted: false },
      select: { id: true, name: true, mobile: true, role: true, language: true, isApproved: true },
    });
    if (!user) throw new Error("user not found");

    req.user = user;
    next();
  } catch {
    next(Object.assign(new Error("Authentication required"), { status: 401 }));
  }
}

/** Restrict a route to a set of roles (run AFTER requireAuth). */
export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(Object.assign(new Error("Forbidden"), { status: 403 }));
    }
    next();
  };
}