import express from "express";
import { getDashboardStats, getWeeklyReport, getTeamPerformance, getRecentActivity } from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.get("/dashboard", getDashboardStats);
router.get("/weekly", getWeeklyReport);
router.get("/team", getTeamPerformance);
router.get("/activity", getRecentActivity);

export default router;
