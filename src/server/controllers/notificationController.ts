import { type Request, type Response, type NextFunction } from "express";
import { Notification } from "../models/Notification.js";

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await Notification.find({ recipient: req.user?.id })
      .populate("actor", "name avatar")
      .sort("-createdAt")
      .limit(50);
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user?.id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await Notification.updateMany({ recipient: req.user?.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user?.id });
    res.json({ success: true });
  } catch (err) { next(err); }
}
