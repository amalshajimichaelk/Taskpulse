import { type Request, type Response, type NextFunction } from "express";
import { Task } from "../models/Task.js";
import { Activity } from "../models/Activity.js";
import { User } from "../models/User.js";

// GET /analytics/dashboard
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
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
  } catch (err) { next(err); }
}

// GET /analytics/weekly
export async function getWeeklyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const weekly = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));
        return Task.countDocuments({ status: "Completed", completedAt: { $gte: start, $lte: end } });
      })
    );

    const data = days.map((name, i) => ({ name, completed: weekly[i], score: weekly[i] * 10 + Math.random() * 20 }));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /analytics/team
export async function getTeamPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find({}).limit(6);
    const performance = await Promise.all(
      users.map(async (u) => {
        const total = await Task.countDocuments({ assignees: u._id });
        const completed = await Task.countDocuments({ assignees: u._id, status: "Completed" });
        return {
          name: u.name,
          total,
          completed,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );
    res.json({ success: true, performance });
  } catch (err) { next(err); }
}

// GET /analytics/activity
export async function getRecentActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activities = await Activity.find()
      .populate("actor", "name avatar")
      .sort("-createdAt")
      .limit(20);
    res.json({ success: true, activities });
  } catch (err) { next(err); }
}
