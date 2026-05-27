import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Tag, Calendar, AlertCircle } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { type Task } from "../store/taskStore";
import { taskService } from "../services/taskService";
import { useToast } from "./ui/Toast";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: Task["status"];
}

const LABEL_OPTIONS = ["Design", "Frontend", "Backend", "API", "Bug", "Feature", "Documentation", "Testing", "DevOps", "Architecture"];
const ASSIGNEE_OPTIONS = ["Elena Rostova", "Marcus Chen", "Sarah Jenkins", "Alex Kim", "Jordan Lee"];

export function NewTaskModal({ isOpen, onClose, defaultStatus = "Todo" }: NewTaskModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: defaultStatus,
    priority: "Medium" as Task["priority"],
    dueDate: "",
    labels: [] as string[],
    assignees: [] as string[],
    progress: 0,
    progressColor: "#6366F1",
  });

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleLabel(label: string) {
    setForm((f) => ({
      ...f,
      labels: f.labels.includes(label) ? f.labels.filter((l) => l !== label) : [...f.labels, label],
    }));
  }

  function toggleAssignee(name: string) {
    setForm((f) => ({
      ...f,
      assignees: f.assignees.includes(name) ? f.assignees.filter((a) => a !== name) : [...f.assignees, name],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);

    try {
      const payload: any = {
        ...form,
        assignees: [], // Cannot send string names; backend expects ObjectIds
      };
      if (!payload.dueDate) delete payload.dueDate; // Prevent Mongoose CastError

      const response = await taskService.createTask(payload);
      // NOTE: Don't call addTask() here — the socket 'task:created' event handles
      // adding it to the store, avoiding the duplicate-task bug.
      success("Task created!", `"${form.title}" added to ${form.status}`);
      setForm({ title: "", description: "", status: defaultStatus, priority: "Medium", dueDate: "", labels: [], assignees: [], progress: 0, progressColor: "#6366F1" });
      onClose();
    } catch (err: any) {
      console.error(err);
      error("Failed to create task", err.response?.data?.message || "Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  }

  const priorityConfig = {
    High: { color: "border-danger text-danger bg-danger/10", icon: "↑" },
    Medium: { color: "border-warning text-warning bg-warning/10", icon: "→" },
    Low: { color: "border-text-secondary text-text-secondary bg-white/5", icon: "↓" },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" description="Add a task to your board" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Input
          label="Task Title *"
          placeholder="e.g. Implement authentication flow..."
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
          autoFocus
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Description</label>
          <textarea
            placeholder="Add more context, requirements, or steps..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Status + Priority + Due */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Status</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>
              {["Todo", "In Progress", "Review", "Completed"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</label>
            <div className="flex gap-2">
              {(["High", "Medium", "Low"] as Task["priority"][]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("priority", p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.priority === p ? priorityConfig[p].color : "border-white/10 text-text-secondary"}`}
                >
                  {priorityConfig[p].icon} {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            leftIcon={<Calendar size={14} />}
          />
        </div>

        {/* Progress & Progress Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary uppercase tracking-wider font-medium">Initial Progress</span>
              <span className="font-bold text-text-primary">{form.progress}%</span>
            </div>
            <input
              type="range"
              min={0} max={100} step={5}
              value={form.progress}
              onChange={(e) => update("progress", Number(e.target.value))}
              className="w-full accent-accent-primary"
            />
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill transition-all" style={{ width: `${form.progress}%`, background: form.progressColor }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Progress Bar Color</label>
            <input
              type="color"
              value={form.progressColor}
              onChange={(e) => update("progressColor", e.target.value)}
              className="h-10 w-full rounded-lg cursor-pointer border border-white/10 bg-surface"
            />
          </div>
        </div>

        {/* Labels */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={12} /> Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {LABEL_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleLabel(label)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  form.labels.includes(label)
                    ? "bg-accent-primary/20 border-accent-primary/40 text-accent-primary"
                    : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignees */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Assign To</label>
          <div className="flex flex-wrap gap-2">
            {ASSIGNEE_OPTIONS.map((name) => {
              const initials = name.split(" ").map((p) => p[0]).join("");
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAssignee(name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    form.assignees.includes(name)
                      ? "bg-accent-primary/15 border-accent-primary/40 text-accent-primary"
                      : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-surface flex items-center justify-center text-[9px] font-bold">
                    {initials}
                  </span>
                  {name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/8">
          <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1" disabled={!form.title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
