import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, MessageSquare, UserPlus, AlertCircle, Info, Check, Trash2, CheckCheck } from "lucide-react";
import { useNotificationStore, type Notification } from "../store/notificationStore";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

// Seed mock notifications if store is empty
const MOCK_NOTIFICATIONS: Notification[] = [
  { _id: "n1", type: "task_assigned", title: "New task assigned", message: "Elena Rostova assigned you to Design System Audit", read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), actor: { name: "Elena Rostova" } },
  { _id: "n2", type: "task_completed", title: "Task completed", message: "Marcus Chen completed API Rate Limiting", read: false, createdAt: new Date(Date.now() - 22 * 60000).toISOString(), actor: { name: "Marcus Chen" } },
  { _id: "n3", type: "comment", title: "New comment", message: "Sarah Jenkins commented on Q3 Planning Sprint", read: false, createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(), actor: { name: "Sarah Jenkins" } },
  { _id: "n4", type: "mention", title: "You were mentioned", message: "Alex Kim mentioned @you in Nexus Platform thread", read: true, createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), actor: { name: "Alex Kim" } },
  { _id: "n5", type: "deadline", title: "Deadline approaching", message: "Design System Audit is due tomorrow", read: true, createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { _id: "n6", type: "invite", title: "Team invitation", message: "You've been added to the Mobile App v2.0 project", read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { _id: "n7", type: "system", title: "System update", message: "TaskPulse has been updated to v2.6.1 with new features", read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
];

const typeIcons: Record<Notification["type"], { icon: typeof Bell; color: string; bg: string }> = {
  task_assigned: { icon: CheckCircle2, color: "text-accent-primary", bg: "bg-accent-primary/15" },
  task_completed: { icon: Check, color: "text-success", bg: "bg-success/15" },
  comment: { icon: MessageSquare, color: "text-accent-secondary", bg: "bg-accent-secondary/15" },
  mention: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/15" },
  deadline: { icon: AlertCircle, color: "text-danger", bg: "bg-danger/15" },
  invite: { icon: UserPlus, color: "text-success", bg: "bg-success/15" },
  system: { icon: Info, color: "text-text-secondary", bg: "bg-white/10" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};
  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const now = new Date();
    let label = "Older";
    if (d.toDateString() === now.toDateString()) label = "Today";
    else if (new Date(now.getTime() - 86400000).toDateString() === d.toDateString()) label = "Yesterday";
    else if (Date.now() - d.getTime() < 7 * 86400000) label = "This Week";
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

export function Notifications() {
  const store = useNotificationStore();
  const notifications = store.notifications.length > 0 ? store.notifications : MOCK_NOTIFICATIONS;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const grouped = groupByDate(displayed);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAll() {
    store.markAllRead();
  }

  function handleMarkRead(id: string) {
    store.markAsRead(id);
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">Notifications</h2>
          <p className="text-sm text-text-secondary">
            {unreadCount > 0 ? <span className="text-danger font-semibold">{unreadCount} unread</span> : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface rounded-xl p-1 border border-white/10">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? "bg-white/10 text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {f}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" icon={<CheckCheck size={14} />} onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification Groups */}
      <div className="space-y-8">
        <AnimatePresence>
          {Object.keys(grouped).length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl p-16 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Bell size={28} className="text-text-secondary/50" />
              </div>
              <p className="text-text-secondary font-medium">No notifications</p>
              <p className="text-xs text-text-secondary/60">You're all caught up!</p>
            </motion.div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <motion.div key={group} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 px-1">{group}</h3>
                <div className="space-y-2">
                  {items.map((notif, i) => {
                    const typeInfo = typeIcons[notif.type] || typeIcons.system;
                    const Icon = typeInfo.icon;
                    return (
                      <motion.div
                        key={notif._id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`
                          glass-panel rounded-xl p-4 flex items-start gap-4 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all cursor-pointer
                          ${!notif.read ? "border-l-2 border-l-accent-primary" : ""}
                        `}
                        onClick={() => !notif.read && handleMarkRead(notif._id)}
                      >
                        <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center flex-none`}>
                          <Icon size={18} className={typeInfo.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${notif.read ? "text-text-secondary" : "text-text-primary"}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-1.5 flex-none">
                              <span className="text-[10px] text-text-secondary">{timeAgo(notif.createdAt)}</span>
                              {!notif.read && <span className="w-2 h-2 rounded-full bg-accent-primary" />}
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{notif.message}</p>
                          {notif.actor && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <Avatar name={notif.actor.name} size="xs" />
                              <span className="text-[11px] text-text-secondary">{notif.actor.name}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
