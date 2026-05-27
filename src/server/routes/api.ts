import express from "express";
import authRoutes from "./auth.js";
import taskRoutes from "./tasks.js";
import projectRoutes from "./projects.js";
import notificationRoutes from "./notifications.js";
import analyticsRoutes from "./analytics.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "TaskPulse API is running.", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/projects", projectRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
