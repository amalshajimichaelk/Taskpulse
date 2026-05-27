import { create } from "zustand";

export interface Notification {
  _id: string;
  type: "task_assigned" | "task_completed" | "comment" | "mention" | "deadline" | "invite" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedTask?: string;
  relatedProject?: string;
  actor?: { name: string };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: (n: Notification[]) => void;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  deleteNotification: (id) =>
    set((s) => {
      const notifications = s.notifications.filter((n) => n._id !== id);
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),
}));
