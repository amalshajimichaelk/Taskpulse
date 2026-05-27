import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, List as ListIcon, Plus, Search, MoreHorizontal, Clock, MessageSquare, Paperclip } from "lucide-react";
import { useTaskStore, type Task } from "../store/taskStore";
import { taskService } from "../services/taskService";
import { TaskCard } from "../components/TaskCard";
import { NewTaskModal } from "../components/NewTaskModal";
import { SkeletonTaskCard } from "../components/ui/SkeletonLoader";
import { AvatarGroup } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";

const COLUMNS: { id: Task["status"]; label: string; color: string; dotColor: string }[] = [
  { id: "Todo", label: "Todo", color: "border-text-secondary/30", dotColor: "bg-text-secondary" },
  { id: "In Progress", label: "In Progress", color: "border-accent-secondary/40", dotColor: "bg-accent-secondary" },
  { id: "Review", label: "Review", color: "border-warning/40", dotColor: "bg-warning" },
  { id: "Completed", label: "Completed", color: "border-success/40", dotColor: "bg-success" },
];

const MOCK_TASKS: Task[] = [
  { _id: "1", id: "TSK-104", title: "Design System Audit & Token Refactoring", status: "Todo", priority: "High", labels: ["Design", "Architecture"], assignees: [{ name: "Elena Rostova" }, { name: "Marcus Chen" }], progress: 0, comments: 3, attachments: 1, dueDate: new Date(Date.now() + 86400000).toISOString() },
  { _id: "2", id: "TSK-092", title: "Glassmorphism Card Container Component", status: "In Progress", priority: "Medium", labels: ["Frontend"], assignees: [{ name: "Elena Rostova" }], progress: 65, comments: 8, attachments: 4, dueDate: new Date().toISOString() },
  { _id: "3", id: "TSK-085", title: "Dark Mode Color Palette Finalization", status: "Review", priority: "Low", labels: ["Design", "Feedback Req"], assignees: [{ name: "Sarah Jenkins" }], progress: 100, comments: 12, attachments: 0 },
  { _id: "4", id: "TSK-078", title: "Authentication Flow — JWT Refresh Logic", status: "In Progress", priority: "High", labels: ["Backend", "Security"], assignees: [{ name: "Marcus Chen" }], progress: 40, comments: 5, attachments: 2, dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
  { _id: "5", id: "TSK-071", title: "Kanban Board Drag-and-Drop Implementation", status: "Completed", priority: "High", labels: ["Frontend"], assignees: [{ name: "Alex Kim" }, { name: "Elena Rostova" }], progress: 100, comments: 15, attachments: 3 },
  { _id: "6", id: "TSK-065", title: "Mobile Responsive Navigation Drawer", status: "Todo", priority: "Medium", labels: ["Frontend", "UX"], assignees: [{ name: "Alex Kim" }], progress: 0, comments: 2, attachments: 0, dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
  { _id: "7", id: "TSK-059", title: "API Rate Limiting & Request Throttling", status: "Review", priority: "High", labels: ["Backend", "API"], assignees: [{ name: "Marcus Chen" }], progress: 90, comments: 6, attachments: 1 },
  { _id: "8", id: "TSK-048", title: "Notification System Real-time Integration", status: "Completed", priority: "Medium", labels: ["Backend", "Socket.IO"], assignees: [{ name: "Marcus Chen" }, { name: "Sarah Jenkins" }], progress: 100, comments: 9, attachments: 2 },
];

export function Tasks() {
  const { tasks, setTasks, moveTask, isLoading, setLoading } = useTaskStore();
  const { success } = useToast();
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filterPriority, setFilterPriority] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<Task["status"]>("Todo");
  const dragIdRef = useRef<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get("/tasks")
      .then((res) => {
        const data = res.data.tasks || res.data;
        if (Array.isArray(data)) {
          setTasks(data); // Will be [] if no tasks exist
        } else {
          setTasks(MOCK_TASKS);
        }
      })
      .catch(() => setTasks(MOCK_TASKS))
      .finally(() => setTimeout(() => setLoading(false), 400));
  }, []);

  const filtered = tasks.filter((t) => {
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── HTML5 Drag-and-Drop ────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    if (e.dataTransfer) e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(colId);
  }

  function handleDrop(e: React.DragEvent, colId: Task["status"]) {
    e.preventDefault();
    e.stopPropagation();
    const dragId = dragIdRef.current;
    if (!dragId) return;

    const task = tasks.find((t) => (t._id === dragId || t.id === dragId));
    if (!task || task.status === colId) {
      dragIdRef.current = null;
      setOverCol(null);
      return;
    }

    // Immediately update the UI (optimistic — works in both real and demo mode)
    moveTask(dragId, colId);
    success(`Moved to ${colId}`);
    dragIdRef.current = null;
    setOverCol(null);

    // Persist to backend (silently revert if it fails)
    taskService.moveTask(dragId, colId).catch(() => {
      moveTask(dragId, task.status); // revert
    });
  }

  function handleDragEnd() {
    dragIdRef.current = null;
    setOverCol(null);
  }

  function handleDragLeave(e: React.DragEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setOverCol(null);
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-header">Nexus Platform Redesign</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="px-3 py-1 rounded-full bg-accent-secondary/15 border border-accent-secondary/30 text-accent-secondary text-xs font-semibold">
              Active Sprint
            </span>
            <span className="text-sm text-text-secondary">Ends in 4 days</span>
            <AvatarGroup names={["Elena Rostova", "Marcus Chen", "Sarah Jenkins", "Alex Kim"]} size="xs" max={4} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-44 text-xs"
            />
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="py-2 pl-3 pr-8 text-xs w-32"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-surface rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === "board" ? "bg-white/10 text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            >
              <Grid size={14} /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === "list" ? "bg-white/10 text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            >
              <ListIcon size={14} /> List
            </button>
          </div>

          <Button
            icon={<Plus size={16} />}
            onClick={() => { setModalDefaultStatus("Todo"); setModalOpen(true); }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Board / List View */}
      {isLoading ? (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-none w-[300px] space-y-4">
              <div className="skeleton h-6 w-32 rounded" />
              {[1, 2].map((i) => <SkeletonTaskCard key={i} />)}
            </div>
          ))}
        </div>
      ) : viewMode === "board" ? (
        /* ── Kanban Board ── */
        <div className="flex gap-5 overflow-x-auto pb-6 flex-1">
          {COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id);
            const isOver = overCol === col.id;

            return (
              <div
                key={col.id}
                className="kanban-col flex flex-col gap-3"
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
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-white/8 transition-colors"
                    onClick={() => { setModalDefaultStatus(col.id); setModalOpen(true); }}
                    title="Add task"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Tasks */}
                <div
                  className={`flex flex-col gap-3 flex-1 min-h-[120px] rounded-xl p-2 transition-all duration-200 ${isOver ? "drag-over" : ""}`}
                >
                  {colTasks.map((task, i) => (
                    <TaskCard
                      key={task._id || task.id}
                      task={task}
                      index={i}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div
                      className="h-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-text-secondary text-xs hover:border-white/25 transition-colors cursor-pointer"
                      onClick={() => { setModalDefaultStatus(col.id); setModalOpen(true); }}
                    >
                      + Add task
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-3 text-left font-semibold">Task</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Priority</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Assignees</th>
                <th className="px-4 py-3 text-left font-semibold hidden xl:table-cell">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-text-secondary/60 hidden sm:block">{task.id}</span>
                      <p className="font-medium text-text-primary">{task.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <AvatarGroup names={task.assignees.map((a) => a.name)} size="xs" max={3} />
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    {task.dueDate ? (
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-xs text-text-secondary/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${task.progress}%`, backgroundColor: task.progressColor || "#6366F1" }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">{task.progress}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Modal */}
      <NewTaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultStatus={modalDefaultStatus} />
    </div>
  );
}
