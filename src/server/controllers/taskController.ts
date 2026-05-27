import { type Request, type Response, type NextFunction } from "express";
import { Task } from "../models/Task.js";
import { Activity } from "../models/Activity.js";

// GET /tasks
export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, priority, project, assignee, search, sort = "-createdAt", limit = "50", page = "1" } = req.query as Record<string, string>;

    const filter: Record<string, any> = { isArchived: false };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignee) filter.assignees = assignee;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(filter)
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({ success: true, tasks, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /tasks/:id
export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name")
      .populate("comments.author", "name avatar");

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
}

// POST /tasks
export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user?.id });

    // Log activity
    if (req.user?.id) {
      await Activity.create({
        actor: req.user.id,
        action: "created",
        target: task.title,
        targetType: "task",
        project: task.project,
        relatedTask: task._id,
      });
    }

    const populated = await task.populate("assignees", "name email avatar");

    // Emit real-time event
    const io = (req as any).io;
    if (io) io.emit("task:created", populated);

    res.status(201).json({ success: true, task: populated });
  } catch (err) {
    next(err);
  }
}

// PATCH /tasks/:id
export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("assignees", "name email avatar");

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const io = (req as any).io;
    if (io) io.emit("task:updated", { id: task._id, updates: req.body });

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
}

// DELETE /tasks/:id
export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const io = (req as any).io;
    if (io) io.emit("task:deleted", { id: req.params.id });

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}

// PATCH /tasks/:id/move
export async function moveTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (req.user?.id) {
      await Activity.create({
        actor: req.user.id,
        action: `moved to ${status}`,
        target: task.title,
        targetType: "task",
        relatedTask: task._id,
        meta: { status },
      });
    }

    const io = (req as any).io;
    if (io) io.emit("task:moved", { id: task._id, status });

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
}

// GET /tasks/stats
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [total, completed, inProgress, review, todo] = await Promise.all([
      Task.countDocuments({ isArchived: false }),
      Task.countDocuments({ status: "Completed", isArchived: false }),
      Task.countDocuments({ status: "In Progress", isArchived: false }),
      Task.countDocuments({ status: "Review", isArchived: false }),
      Task.countDocuments({ status: "Todo", isArchived: false }),
    ]);

    const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ success: true, stats: { total, completed, inProgress, review, todo, productivityScore } });
  } catch (err) {
    next(err);
  }
}
