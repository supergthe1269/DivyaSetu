import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../services/db.js";

export interface JwtPayload {
  sub: number; // user id
  role: string;
}

export function signToken(userId: number, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as unknown as JwtPayload;
}

/** Load a fresh (non-deleted) user by id — used by `me` and middleware enrichment. */
export async function loadUser(id: number) {
  return prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, name: true, mobile: true, role: true, language: true, isApproved: true },
  });
}