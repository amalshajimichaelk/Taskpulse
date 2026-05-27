import "dotenv/config";
import express from "express";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import apiRoutes from "./src/server/routes/api.js";
import mockApi from "./src/server/mockApi.js";
import { errorHandler, notFound } from "./src/server/middleware/errorHandler.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const onlineUsers = new Map<string, string>(); // userId -> socketId

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // ── DB Connection ──────────────────────────────────────
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
    }
  } else {
    console.log("ℹ️  No MONGODB_URI — running in demo/mock mode.");
  }

  // ── Middleware ─────────────────────────────────────────
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Socket.IO Auth + Events ────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        let decoded: any;
        if (token === "demo-token") {
          decoded = { id: "000000000000000000000000", name: "Alex Demo", email: "demo@taskpulse.io", role: "Project Manager" };
        } else {
          const secret = process.env.JWT_SECRET || "dev-secret-change-in-prod";
          decoded = jwt.verify(token, secret) as any;
        }
        (socket as any).user = decoded;
      } catch {
        // Allow unauthenticated socket connections in dev
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    if (user?.id) {
      onlineUsers.set(user.id, socket.id);
      io.emit("user:online", { userId: user.id });
      console.log(`🟢 User ${user.name} connected (${socket.id})`);
    }

    socket.on("join:project", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("leave:project", (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("disconnect", () => {
      if (user?.id) {
        onlineUsers.delete(user.id);
        io.emit("user:offline", { userId: user.id, lastSeen: new Date().toISOString() });
        console.log(`🔴 User ${user?.name} disconnected`);
      }
    });
  });

  // Attach io to req
  app.use((req, _res, next) => {
    (req as any).io = io;
    next();
  });

  // ── API Routes ─────────────────────────────────────────
  app.use("/api", (req, res, next) => {
    const isDemoMode = req.headers.authorization?.includes("demo-token");
    if (!isDemoMode && process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
      apiRoutes(req, res, next);
    } else {
      mockApi(req, res, next);
    }
  });
  app.use("/api/*", notFound);
  app.use(errorHandler);

  // ── Vite / Static ──────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 TaskPulse server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
