import { create } from "zustand";

export interface Task {
  _id: string;
  id?: string; // legacy compat
  title: string;
  description?: string;
  status: "Todo" | "In Progress" | "Review" | "Completed";
  priority: "High" | "Medium" | "Low";
  labels: string[];
  assignees: Array<{ name: string; _id?: string }>;
  progress: number;
  progressColor?: string;
  comments: number;
  attachments: number;
  dueDate?: string;
  project?: string;
  createdAt?: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: Task["status"]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),

  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        (t._id === id || t.id === id) ? { ...t, ...updates } : t
      ),
    })),

  deleteTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t._id !== id && t.id !== id),
    })),

  moveTask: (id, newStatus) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        (t._id === id || t.id === id) ? { ...t, status: newStatus } : t
      ),
    })),

  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
}));
