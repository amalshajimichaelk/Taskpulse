import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreVertical, Calendar, TrendingUp, FolderOpen,
  Zap, AlertCircle, Pencil, Trash2
} from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { AvatarGroup } from "../components/ui/Avatar";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";

interface Project {
  id: string;
  _id?: string;
  name: string;
  description: string;
  status: "Active" | "Planning" | "On Hold" | "Completed" | "Cancelled";
  progress: number;
  members: (string | { name: string; avatar?: string })[];
  deadline?: string;
  tasks?: { total: number; completed: number };
  color: string;
  priority?: "High" | "Medium" | "Low";
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1", name: "Nexus Platform Redesign", description: "Complete UI/UX overhaul of the Nexus SaaS platform with glassmorphism design system",
    status: "Active", progress: 68, members: ["Elena Rostova", "Marcus Chen", "Alex Kim"],
    deadline: "2026-06-15", tasks: { total: 48, completed: 33 }, color: "#6366F1", priority: "High"
  },
  {
    id: "p2", name: "Mobile App v2.0", description: "React Native rebuild with offline support and biometric authentication",
    status: "Active", progress: 35, members: ["Sarah Jenkins", "Alex Kim"],
    deadline: "2026-07-30", tasks: { total: 32, completed: 11 }, color: "#06B6D4", priority: "High"
  },
  {
    id: "p3", name: "Backend Microservices Migration", description: "Migrate monolithic backend to distributed microservices architecture",
    status: "Planning", progress: 12, members: ["Marcus Chen"],
    deadline: "2026-09-01", tasks: { total: 24, completed: 3 }, color: "#10B981", priority: "Medium"
  },
  {
    id: "p4", name: "Analytics Dashboard", description: "Real-time analytics and reporting platform with ML-powered insights",
    status: "On Hold", progress: 55, members: ["Elena Rostova", "Sarah Jenkins", "Marcus Chen", "Alex Kim"],
    deadline: "2026-08-15", tasks: { total: 18, completed: 10 }, color: "#F59E0B", priority: "Low"
  },
];

const statusMap: Record<string, "success" | "info" | "warning" | "default"> = {
  Active: "success",
  Planning: "info",
  "On Hold": "warning",
  Completed: "default",
  Cancelled: "default",
};

const COLUMNS: { id: Project["status"]; label: string; color: string; dotColor: string }[] = [
  { id: "Planning", label: "Planning", color: "border-accent-secondary/40", dotColor: "bg-accent-secondary" },
  { id: "Active", label: "Active", color: "border-success/40", dotColor: "bg-success" },
  { id: "On Hold", label: "On Hold", color: "border-warning/40", dotColor: "bg-warning" },
  { id: "Completed", label: "Completed", color: "border-text-secondary/30", dotColor: "bg-text-secondary" },
];

// Project card with More Options menu
function ProjectCard({ project, onUpdate, onDelete, onDragStart, onDragEnd }: {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(project.progress);
  const [progressColor, setProgressColor] = useState(project.color);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { success, error } = useToast();

  const memberNames = (project.members as any[]).map((m) =>
    typeof m === "string" ? m : (m?.name || "")
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleProgressSave() {
    setSaving(true);
    try {
      await api.patch(`/projects/${project._id || project.id}`, { progress: progressVal, color: progressColor });
      onUpdate(project._id || project.id, { progress: progressVal, color: progressColor });
      success("Progress updated!");
      setProgressOpen(false);
    } catch {
      error("Failed to update", "Could not save progress.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    try {
      await api.delete(`/projects/${project._id || project.id}`);
      onDelete(project._id || project.id);
      success("Project deleted");
    } catch {
      error("Failed to delete", "Could not delete this project.");
    }
  }

  const projectId = project._id || project.id;

  return (
    <>
      <div
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", projectId);
          onDragStart?.(e, projectId);
        }}
        onDragEnd={onDragEnd}
        className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 transition-all duration-300 group cursor-grab active:cursor-grabbing select-none"
      >
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
              style={{ background: `${project.color}20`, border: `1px solid ${project.color}30` }}
            >
              <FolderOpen size={18} style={{ color: project.color }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-text-primary text-sm leading-snug">{project.name}</h3>
              <Badge variant={statusMap[project.status]} size="sm" dot className="mt-1">
                {project.status}
              </Badge>
            </div>
          </div>

          {/* More Options */}
          <div className="relative flex-none" ref={menuRef}>
            <button
              draggable={false}
              onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="text-text-secondary/60 hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-white/8 cursor-pointer flex-none"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-8 z-50 w-48 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary px-3 py-2">More Options</p>
                    <button
                      onClick={() => { setMenuOpen(false); setProgressOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-white/8 rounded-lg transition-colors"
                    >
                      <TrendingUp size={13} className="text-accent-primary" /> Update Progress
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-white/8 rounded-lg transition-colors"
                    >
                      <Pencil size={13} className="text-accent-secondary" /> Edit Project
                    </button>
                    <div className="border-t border-white/8 my-1" />
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Delete Project
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{project.description}</p>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-text-secondary">Progress</span>
            <span className="font-bold text-text-primary">{project.progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ background: project.color, width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/8">
          <AvatarGroup names={memberNames} size="xs" max={4} />
          <div className="flex items-center gap-3 text-right">
            <div className="text-xs text-text-secondary">
              <span className="font-bold text-text-primary">{project.tasks?.completed || 0}</span>/{project.tasks?.total || 0} tasks
            </div>
            {project.deadline && (
              <div className="text-xs flex items-center gap-1 text-text-secondary">
                <Calendar size={11} />
                {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Progress Modal */}
      <Modal isOpen={progressOpen} onClose={() => setProgressOpen(false)} title="Update Project Progress" size="sm">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Progress</span>
              <span className="font-bold text-text-primary">{progressVal}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="w-full accent-accent-primary"
            />
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill transition-all" style={{ width: `${progressVal}%`, background: progressColor }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Bar Color</label>
            <input
              type="color" value={progressColor}
              onChange={(e) => setProgressColor(e.target.value)}
              className="h-10 w-full rounded-lg cursor-pointer border border-white/10 bg-surface"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setProgressOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleProgressSave} loading={saving} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Project" size="md">
        <EditProjectForm project={project} onClose={() => setEditOpen(false)} onSaved={(updates) => { onUpdate(project._id || project.id, updates); }} />
      </Modal>
    </>
  );
}

function EditProjectForm({ project, onClose, onSaved }: { project: Project; onClose: () => void; onSaved: (u: Partial<Project>) => void }) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    deadline: project.deadline ? project.deadline.split("T")[0] : "",
    color: project.color,
  });
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!payload.deadline) delete payload.deadline;
      await api.patch(`/projects/${project._id || project.id}`, payload);
      onSaved(payload);
      success("Project updated!");
      onClose();
    } catch {
      error("Failed to update", "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Input label="Project Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Description</label>
        <textarea rows={3} className="resize-none" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Status</label>
          <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
            {["Active", "Planning", "On Hold", "Completed", "Cancelled"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Project Color</label>
        <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 w-full rounded-lg cursor-pointer border border-white/10 bg-surface" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
      </div>
    </div>
  );
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", deadline: "", color: "#6366F1", status: "Active" as Project["status"] });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const dragIdRef = useRef<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, id: string) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
    if (e.dataTransfer) e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(colId);
  }

  function handleDragLeave(e: React.DragEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setOverCol(null);
    }
  }

  function handleDragEnd() {
    dragIdRef.current = null;
    setOverCol(null);
  }

  async function handleDrop(e: React.DragEvent, colId: Project["status"]) {
    e.preventDefault();
    e.stopPropagation();
    const dragId = dragIdRef.current;
    if (!dragId) return;

    const project = projects.find(p => p._id === dragId || p.id === dragId);
    if (!project || project.status === colId) {
      dragIdRef.current = null;
      setOverCol(null);
      return;
    }

    // Optimistic UI update
    handleUpdate(dragId, { status: colId });
    success(`Project moved to ${colId}`);
    dragIdRef.current = null;
    setOverCol(null);

    // Persist to backend database
    try {
      await api.patch(`/projects/${dragId}`, { status: colId });
    } catch {
      handleUpdate(dragId, { status: project.status }); // revert on failure
      error("Failed to update status");
    }
  }

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      if (res.data.projects) {
        const normalized = res.data.projects.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          color: p.color || "#6366F1",
          progress: p.progress || 0,
          members: (p.members || []).map((m: any) =>
            typeof m === "string" ? m : (m?.name || "")
          ),
        }));
        setProjects(normalized);
      }
    } catch (err) {
      setProjects(MOCK_PROJECTS);
    }
  };

  function handleUpdate(id: string, updates: Partial<Project>) {
    setProjects(ps => ps.map(p => (p._id === id || p.id === id) ? { ...p, ...updates } : p));
  }

  function handleDelete(id: string) {
    setProjects(ps => ps.filter(p => p._id !== id && p.id !== id));
  }

  const filtered = projects.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.deadline) delete payload.deadline;
      await api.post("/projects", payload);
      await fetchProjects();
      success("Project created!", form.name);
      setModalOpen(false);
      setForm({ name: "", description: "", deadline: "", color: "#6366F1", status: "Active" });
    } catch (err: any) {
      error("Failed to create project", err.response?.data?.message || "Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-header">Projects</h2>
          <p className="text-sm text-text-secondary">{projects.filter(p => p.status === "Active").length} active · {projects.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-3.5 h-3.5" />
            <input
              type="text" placeholder="Search projects..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs w-44"
            />
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>New Project</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active", value: projects.filter(p => p.status === "Active").length, color: "text-success", icon: Zap },
          { label: "Planning", value: projects.filter(p => p.status === "Planning").length, color: "text-accent-secondary", icon: Calendar },
          { label: "On Hold", value: projects.filter(p => p.status === "On Hold").length, color: "text-warning", icon: AlertCircle },
          { label: "Completed", value: projects.filter(p => p.status === "Completed").length, color: "text-text-secondary", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-2xl font-bold font-display text-text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board of Projects */}
      <div className="flex gap-5 overflow-x-auto pb-6 flex-1 min-h-[450px]">
        {COLUMNS.map((col) => {
          const colProjects = filtered.filter((p) => p.status === col.id);
          const isOver = overCol === col.id;

          return (
            <div
              key={col.id}
              className="kanban-col flex flex-col gap-3 min-w-[320px]"
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={handleDragLeave}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-1 pb-3 border-b-2 ${col.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <h3 className="font-bold text-sm text-text-primary">{col.label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface border border-white/10 text-[10px] font-bold text-text-secondary">
                    {colProjects.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-white/8 transition-colors cursor-pointer"
                  onClick={() => { setForm(f => ({ ...f, status: col.id })); setModalOpen(true); }}
                  title="Add project"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Projects List in Column */}
              <div
                className={`flex flex-col gap-4 flex-1 min-h-[200px] rounded-xl p-1 transition-all duration-200 ${isOver ? "drag-over" : ""}`}
              >
                {colProjects.map((project) => (
                  <ProjectCard
                    key={project._id || project.id}
                    project={project}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {colProjects.length === 0 && (
                  <div
                    className="h-28 rounded-2xl border-2 border-dashed border-white/10 hover:border-accent-primary/30 flex flex-col items-center justify-center text-text-secondary text-xs hover:text-accent-primary hover:bg-accent-primary/5 transition-all cursor-pointer group"
                    onClick={() => { setForm(f => ({ ...f, status: col.id })); setModalOpen(true); }}
                  >
                    <Plus size={16} className="text-text-secondary/50 group-hover:text-accent-primary mb-1 transition-colors" />
                    <span>Create Project</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Project" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project Name *" placeholder="e.g. Mobile App v3.0" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Description</label>
            <textarea placeholder="What is this project about?" rows={3} className="resize-none" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
                {["Planning", "Active", "On Hold", "Completed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Project Color</label>
              <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 w-full rounded-lg cursor-pointer border border-white/10 bg-surface" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1" disabled={!form.name.trim()}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
