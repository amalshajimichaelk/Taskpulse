import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Briefcase, Calendar, MapPin, Edit3, CheckCircle2, Clock, TrendingUp, Save } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Avatar } from "../components/ui/Avatar";
import { RoleBadge, Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { ActivityFeed } from "../components/ActivityFeed";
import api from "../services/api";

const recentTasks = [
  { title: "Glassmorphism Card Component", status: "Completed", priority: "Medium" },
  { title: "Design System Audit", status: "In Progress", priority: "High" },
  { title: "Mobile Navigation Drawer", status: "In Progress", priority: "Medium" },
  { title: "OTP Verification Flow", status: "Completed", priority: "Low" },
];

export function Profile() {
  const { user, setUser } = useAuthStore();
  const { success, error } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    jobTitle: user?.jobTitle || "",
    location: user?.location || "",
  });

  // Sync form whenever the auth store user is updated (e.g. from /auth/me on startup)
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        jobTitle: user.jobTitle || "",
        location: user.location || "",
      });
    }
  }, [user?.name, user?.bio, user?.jobTitle, user?.location]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", {
        name: form.name,
        bio: form.bio,
        jobTitle: form.jobTitle,
        location: form.location,
      });
      // Persist the returned user object (from DB) into the auth store
      if (user) setUser({ ...user, ...res.data.user });
      success("Profile updated!", "Your changes have been saved.");
      setEditOpen(false);
    } catch (err: any) {
      error("Update failed", err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    { label: "Tasks Done", value: "84", icon: CheckCircle2, color: "text-success" },
    { label: "In Progress", value: "12", icon: Clock, color: "text-accent-secondary" },
    { label: "Projects", value: "5", icon: TrendingUp, color: "text-accent-primary" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <h2 className="page-header">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="relative">
            {user && <Avatar name={user.name} size="xl" status="online" />}
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center shadow-lg hover:bg-accent-primary/90 transition-colors">
              <Edit3 size={12} className="text-white" />
            </button>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold font-display text-text-primary">{user?.name || "Your Name"}</h3>
            {user && <RoleBadge role={user.role} />}
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{form.bio}</p>
          </div>

          <div className="w-full space-y-2.5 text-sm text-text-secondary">
            <div className="flex items-center gap-2"><Mail size={14} /><span className="truncate">{user?.email}</span></div>
            <div className="flex items-center gap-2"><Briefcase size={14} /><span>{form.jobTitle}</span></div>
            <div className="flex items-center gap-2"><MapPin size={14} /><span>{form.location}</span></div>
            <div className="flex items-center gap-2"><Calendar size={14} /><span>Joined Jan 2025</span></div>
          </div>

          <Button variant="outline" size="sm" icon={<Edit3 size={13} />} onClick={() => setEditOpen(true)} className="w-full">
            Edit Profile
          </Button>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-panel rounded-2xl p-5 text-center">
                  <Icon size={22} className={`${s.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold font-display text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Productivity bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Weekly Productivity</h3>
              <Badge variant="success" dot size="sm">On track</Badge>
            </div>
            <div className="flex items-end gap-2 h-20">
              {[45, 70, 55, 90, 80, 40, 85].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-accent-primary to-accent-secondary"
                  style={{ height: `${h}%`, opacity: 0.6 + (i / 6) * 0.4 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.2 + i * 0.05, origin: "bottom" }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary mt-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
            </div>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-6">
            <h3 className="section-title mb-4">Recent Tasks</h3>
            <div className="space-y-2">
              {recentTasks.map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === "High" ? "bg-danger" : task.priority === "Medium" ? "bg-warning" : "bg-text-secondary"}`} />
                    <p className="text-sm font-medium text-text-primary">{task.title}</p>
                  </div>
                  <Badge variant={task.status === "Completed" ? "success" : "info"} size="sm">
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel rounded-2xl p-6">
            <h3 className="section-title mb-5">Recent Activity</h3>
            <ActivityFeed />
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="md">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Job Title" value={form.jobTitle} onChange={(e) => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
          <Input label="Location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Bio</label>
            <textarea rows={3} className="resize-none" value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} icon={<Save size={14} />} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
