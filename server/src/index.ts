import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/index.js";
import { prisma } from "./services/db.js";
import authRoutes from "./routes/auth.routes.js";
import deviceRoutes from "./routes/devices.routes.js";
import needsRoutes from "./routes/needs.routes.js";
import matchRoutes from "./routes/matches.routes.js";
import certRoutes from "./routes/certifications.routes.js";
import transferRoutes from "./routes/transfers.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import reportRoutes from "./routes/reports.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "divyasetu-server", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/needs", needsRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/certifications", certRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler — turns thrown errors into JSON responses
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const message = status === 500 ? "Internal server error" : (err.message || "Error");
  if (status === 500) console.error("[error]", err);
  res.status(status).json({ error: message });
});

const server = app.listen(config.port, async () => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log(`✅ DivyaSetu API listening on :${config.port} (DB reachable)`);
  } catch (e) {
    console.error(`⚠️  API on :${config.port} but DB NOT reachable — is Postgres running?`, (e as Error).message);
  }
});

export { app, server };