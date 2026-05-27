import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MessageSquare, Paperclip, MoreHorizontal, GripVertical, Pencil, Trash2, TrendingUp } from "lucide-react";
import { PriorityBadge } from "./ui/Badge";
import { AvatarGroup } from "./ui/Avatar";
import type { Task } from "../store/taskStore";
import { useTaskStore } from "../store/taskStore";
import { taskService } from "../services/taskService";
import { useToast } from "./ui/Toast";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface TaskCardProps {
  key?: any;
  task: Task;
  index?: number;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  onClick?: (task: Task) => void;
}

function formatDue(due?: string) {
  if (!due) return null;
  const d = new Date(due);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: "Overdue", color: "text-danger" };
  if (days === 0) return { label: "Due Today", color: "text-warning" };
  if (days === 1) return { label: "Due Tomorrow", color: "text-warning" };
  return { label: `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, color: "text-text-secondary" };
}

export function TaskCard({ task, index = 0, draggable = true, onDragStart, onDragEnd, onClick }: TaskCardProps) {
  const taskId = task._id || task.id || "";
  const due = formatDue(task.dueDate);
  const { updateTask, deleteTask } = useTaskStore();
  const { success, error } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(task.progress || 0);
  const [progressColor, setProgressColor] = useState((task as any).progressColor || "#6366F1");
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const priorityBorder = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#94A3B8",
  }[task.priority] ?? "#94A3B8";

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleDelete() {
    setMenuOpen(false);
    try {
      await taskService.deleteTask(taskId);
      deleteTask(taskId);
      success("Task deleted");
    } catch {
      error("Failed to delete", "Could not delete this task.");
    }
  }

  async function handleProgressSave() {
    setSaving(true);
    try {
      await taskService.updateTask(taskId, { progress: progressVal, progressColor } as any);
      updateTask(taskId, { progress: progressVal, progressColor } as any);
      success("Progress updated!");
      setProgressOpen(false);
    } catch {
      error("Failed to update", "Could not update progress.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        draggable={draggable}
        onDragStart={draggable && onDragStart ? (e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", taskId);
          onDragStart(e, taskId);
        } : undefined}
        onDragEnd={onDragEnd}
        onClick={() => onClick?.(task)}
        className={`glass-panel p-4 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 transition-all duration-200 border-l-[3px] group select-none`}
        style={{ borderLeftColor: priorityBorder }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono text-text-secondary/70 shrink-0">
              {task.id || (taskId ? `#${taskId.slice(-4)}` : "–")}
            </span>
            {due?.label === "Due Today" || due?.label === "Overdue" ? (
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${due.label === "Overdue" ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning"}`}>
                {due.label}
              </span>
            ) : null}
          </div>

          {/* More Options menu */}
          <div className="relative flex-none" ref={menuRef}>
            <button
              draggable={false}
              onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="text-text-secondary/60 hover:text-text-primary transition-all p-1.5 rounded-lg hover:bg-white/8 cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-6 z-50 w-44 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden"
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
                      <Pencil size={13} className="text-accent-secondary" /> Edit Task
                    </button>
                    <div className="border-t border-white/8 my-1" />
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Delete Task
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-text-primary mb-2.5 leading-snug line-clamp-2">
          {task.title}
        </h4>

        {/* Labels */}
        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Priority badge */}
        <div className="mb-3">
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Progress bar — always visible */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-text-secondary mb-1">
            <span>Progress</span>
            <span>{task.progress || 0}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ background: (task as any).progressColor || "#6366F1", width: `${task.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-text-secondary/70">
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare size={12} />
              <span>{typeof task.comments === "number" ? task.comments : 0}</span>
            </span>
            {typeof task.attachments === "number" && task.attachments > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <Paperclip size={12} />
                <span>{task.attachments}</span>
              </span>
            )}
            {due && due.label !== "Due Today" && due.label !== "Overdue" && (
              <span className={`flex items-center gap-1 text-xs ${due.color}`}>
                <Clock size={12} />
                <span>{due.label === "Due Tomorrow" ? "Tomorrow" : due.label.replace("Due ", "")}</span>
              </span>
            )}
          </div>

          {task.assignees?.length > 0 && (
            <AvatarGroup names={task.assignees.map((a) => a.name)} size="xs" max={3} />
          )}
        </div>
      </div>

      {/* Update Progress Modal */}
      <Modal isOpen={progressOpen} onClose={() => setProgressOpen(false)} title="Update Progress" size="sm">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Progress</span>
              <span className="font-bold text-text-primary">{progressVal}%</span>
            </div>
            <input
              type="range"
              min={0} max={100} step={5}
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="w-full accent-accent-primary"
            />
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill transition-all duration-300" style={{ width: `${progressVal}%`, background: progressColor }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Bar Color</label>
            <input
              type="color"
              value={progressColor}
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

      {/* Edit Task Modal — basic for now */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Task" size="md">
        <EditTaskForm task={task} onClose={() => setEditOpen(false)} />
      </Modal>
    </>
  );
}

// Inline edit form component
function EditTaskForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const { updateTask } = useTaskStore();
  const { success, error } = useToast();
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);
  const taskId = task._id || task.id || "";

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      await taskService.updateTask(taskId, payload);
      updateTask(taskId, payload);
      success("Task updated!");
      onClose();
    } catch {
      error("Failed to update", "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Description</label>
        <textarea rows={3} className="resize-none" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Status</label>
          <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</label>
          <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value as any }))}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
      </div>
    </div>
  );
}
