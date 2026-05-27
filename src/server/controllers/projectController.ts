import { type Request, type Response, type NextFunction } from "express";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await Project.find({ isArchived: false })
      .populate("owner", "name avatar")
      .populate("members", "name avatar")
      .sort("-createdAt");
    res.json({ success: true, projects });
  } catch (err) { next(err); }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name avatar")
      .populate("members", "name avatar");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, project });
  } catch (err) { next(err); }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await Project.create({ ...req.body, owner: req.user?.id, members: [req.user?.id] });
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, project });
  } catch (err) { next(err); }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await Project.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: "Project archived" });
  } catch (err) { next(err); }
}

export async function getProjectAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const [total, completed, inProgress, review, todo] = await Promise.all([
      Task.countDocuments({ project: id }),
      Task.countDocuments({ project: id, status: "Completed" }),
      Task.countDocuments({ project: id, status: "In Progress" }),
      Task.countDocuments({ project: id, status: "Review" }),
      Task.countDocuments({ project: id, status: "Todo" }),
    ]);
    res.json({ success: true, analytics: { total, completed, inProgress, review, todo } });
  } catch (err) { next(err); }
}
