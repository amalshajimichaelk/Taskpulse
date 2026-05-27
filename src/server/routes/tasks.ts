import express from "express";
import { getTasks, getTask, createTask, updateTask, deleteTask, moveTask, getStats } from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getStats);
router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.patch("/:id/move", moveTask);
router.delete("/:id", deleteTask);

export default router;
