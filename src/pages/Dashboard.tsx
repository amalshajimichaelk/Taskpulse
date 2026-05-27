import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, TrendingUp, Clock, Zap, CalendarDays, MoreHorizontal,
  ArrowUpRight, CheckCircle2, Timer
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { ActivityFeed } from "../components/ActivityFeed";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { SkeletonCard, SkeletonChart } from "../components/ui/SkeletonLoader";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";

const weeklyData = [
  { name: "Mon", score: 30, tasks: 4 },
  { name: "Tue", score: 55, tasks: 7 },
  { name: "Wed", score: 85, tasks: 11 },
  { name: "Thu", score: 60, tasks: 8 },
  { name: "Fri", score: 75, tasks: 9 },
  { name: "Sat", score: 90, tasks: 12 },
  { name: "Sun", score: 80, tasks: 10 },
];

const teamMembers = [
  { name: "Elena Rostova", role: "UI/UX Designer", status: "online" as const, tasks: 24, completion: 87 },
  { name: "Marcus Chen", role: "Backend Engineer", status: "online" as const, tasks: 18, completion: 73 },
  { name: "Sarah Jenkins", role: "Product Manager", status: "busy" as const, tasks: 31, completion: 95 },
  { name: "Alex Kim", role: "Frontend Dev", status: "away" as const, tasks: 14, completion: 64 },
];

const upcomingDeadlines = [
  { title: "Design System Audit", due: "Tomorrow", priority: "High", project: "Nexus Platform" },
  { title: "API Documentation", due: "In 2 days", priority: "Medium", project: "Backend v2" },
  { title: "Q3 Review Presentation", due: "In 4 days", priority: "High", project: "Strategy" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-text-primary mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 128, completed: 84, inProgress: 32, todo: 12, productivityScore: 92 });
  const { success } = useToast();

  useEffect(() => {
    api.get("/analytics/dashboard")
      .then((res) => { setStats(res.data.stats); })
      .catch(() => {})
      .finally(() => setTimeout(() => setLoading(false), 600));
  }, []);

  const handleExport = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      stats,
      weeklyData,
      teamMembers,
      upcomingDeadlines
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskpulse-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    success("Export Complete", "Dashboard data exported successfully.");
  };

  const statCards = [
    {
      title: "Total Tasks", value: stats.total, icon: ClipboardList,
      color: "text-accent-primary", bg: "from-accent-primary/20 to-transparent",
      change: "+12%", changeLabel: "from last month", trend: "up"
    },
    {
      title: "Completed", value: stats.completed, icon: CheckCircle2,
      color: "text-success", bg: "from-success/20 to-transparent",
      change: `${Math.round((stats.completed / (stats.total || 1)) * 100)}%`, changeLabel: "completion rate", trend: "up"
    },
    {
      title: "In Progress", value: stats.inProgress, icon: Timer,
      color: "text-accent-secondary", bg: "from-accent-secondary/20 to-transparent",
      change: "4 due soon", changeLabel: "needs attention", trend: "neutral"
    },
    {
      title: "Productivity", value: `${stats.productivityScore}%`, icon: Zap,
      color: "text-warning", bg: "from-warning/20 to-transparent",
      change: "+5pts", changeLabel: "vs last week", trend: "up"
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-header">Analytics Overview</h2>
          <p className="text-sm text-text-secondary">Real-time performance metrics for Q3 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <CalendarDays size={15} /> Last 30 Days
          </button>
          <button onClick={handleExport} className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2">
            <ArrowUpRight size={15} /> Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] transition-shadow"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-50`} />
              <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={56} className={card.color} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest mb-3">
                  {card.title}
                </p>
                <h3 className="text-4xl font-bold text-text-primary font-display">{card.value}</h3>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className={`text-xs font-bold ${card.color}`}>{card.change}</span>
                  <span className="text-xs text-text-secondary">{card.changeLabel}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="section-title">Weekly Productivity</h3>
              <p className="text-xs text-text-secondary mt-0.5">Task completion trend this week</p>
            </div>
            <button className="text-text-secondary hover:text-text-primary transition-colors"><MoreHorizontal size={18} /></button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="Score" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" dot={false} />
                <Area type="monotone" dataKey="tasks" name="Tasks" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-panel rounded-2xl p-6 flex flex-col"
        >
          <h3 className="section-title mb-6">Task Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)]"
              style={{
                background: `conic-gradient(
                  #10B981 0deg ${Math.round((stats.completed / (stats.total || 1)) * 360)}deg,
                  #06B6D4 ${Math.round((stats.completed / (stats.total || 1)) * 360)}deg ${Math.round(((stats.completed + stats.inProgress) / (stats.total || 1)) * 360)}deg,
                  #F59E0B ${Math.round(((stats.completed + stats.inProgress) / (stats.total || 1)) * 360)}deg ${Math.round(((stats.completed + stats.inProgress + (stats.todo || 12)) / (stats.total || 1)) * 360)}deg,
                  #1E293B ${Math.round(((stats.completed + stats.inProgress + (stats.todo || 12)) / (stats.total || 1)) * 360)}deg 360deg
                )`
              }}
            >
              <div className="absolute w-28 h-28 bg-bg-secondary rounded-full flex flex-col items-center justify-center shadow-inner z-10">
                <span className="text-2xl font-bold font-display text-text-primary">{stats.total}</span>
                <span className="text-[10px] text-text-secondary">Total</span>
              </div>
            </div>

            <div className="w-full mt-6 space-y-2.5">
              {[
                { label: "Completed", color: "bg-success", value: stats.completed },
                { label: "In Progress", color: "bg-accent-secondary", value: stats.inProgress },
                { label: "Review", color: "bg-warning", value: stats.todo || 12 },
                { label: "Todo", color: "bg-text-secondary/40", value: stats.total - stats.completed - stats.inProgress - (stats.todo || 12) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-none ${item.color}`} />
                    <span className="text-text-secondary">{item.label}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Activity + Team + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Activity Feed</h3>
            <span className="text-xs text-accent-secondary font-medium">Live</span>
          </div>
          <ActivityFeed />
        </motion.div>

        {/* Team Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Team Online</h3>
            <Badge variant="success" dot size="sm">
              {teamMembers.filter((m) => m.status === "online").length} online
            </Badge>
          </div>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <Avatar name={member.name} size="sm" status={member.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{member.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-text-secondary truncate">{member.role}</p>
                </div>
                <div className="text-right flex-none">
                  <p className="text-xs font-bold text-text-primary">{member.completion}%</p>
                  <div className="w-14 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-primary"
                      style={{ width: `${member.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Upcoming Deadlines</h3>
            <Clock size={16} className="text-warning" />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-text-primary leading-snug">{item.title}</p>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-none ${item.priority === "High" ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning"}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary">{item.project}</span>
                  <span className="text-[10px] text-warning font-medium">{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
