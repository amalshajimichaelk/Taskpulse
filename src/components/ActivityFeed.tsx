import { motion } from "framer-motion";
import { Avatar } from "./ui/Avatar";

interface ActivityItem {
  _id?: string;
  actor?: { name: string; avatar?: string };
  action: string;
  target: string;
  targetType?: string;
  createdAt: string;
}

const mockActivity: ActivityItem[] = [
  { _id: "1", actor: { name: "Elena Rostova" }, action: "completed", target: "Glassmorphism Card Component", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { _id: "2", actor: { name: "Marcus Chen" }, action: "moved to Review", target: "API Rate Limiting", createdAt: new Date(Date.now() - 18 * 60000).toISOString() },
  { _id: "3", actor: { name: "Sarah Jenkins" }, action: "created", target: "Q3 Planning Sprint", createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
  { _id: "4", actor: { name: "Alex Kim" }, action: "commented on", target: "Dark Mode Palette", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { _id: "5", actor: { name: "Elena Rostova" }, action: "assigned", target: "Onboarding Flow Redesign", createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const actionColors: Record<string, string> = {
  completed: "text-success",
  created: "text-accent-primary",
  "moved to Review": "text-warning",
  "moved to In Progress": "text-accent-secondary",
  assigned: "text-accent-secondary",
  commented: "text-text-secondary",
  default: "text-text-secondary",
};

function getActionColor(action: string) {
  for (const key of Object.keys(actionColors)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return actionColors[key];
  }
  return actionColors.default;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items = mockActivity, className = "" }: ActivityFeedProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <motion.div
          key={item._id || i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-start gap-3 group"
        >
          {/* Timeline line */}
          <div className="relative flex-none">
            <Avatar name={item.actor?.name || "User"} size="xs" />
            {i < items.length - 1 && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-4 bg-white/10" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-3">
            <p className="text-sm leading-snug">
              <span className="font-semibold text-text-primary">{item.actor?.name || "Someone"}</span>{" "}
              <span className={`font-medium ${getActionColor(item.action)}`}>{item.action}</span>{" "}
              <span className="text-text-secondary">{item.target}</span>
            </p>
            <p className="text-[11px] text-text-secondary/60 mt-0.5">{timeAgo(item.createdAt)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
