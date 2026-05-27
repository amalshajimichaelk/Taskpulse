import express from "express";
import { getProjects, getProject, createProject, updateProject, deleteProject, getProjectAnalytics } from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.get("/", getProjects);
router.get("/:id", getProject);
router.get("/:id/analytics", getProjectAnalytics);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
