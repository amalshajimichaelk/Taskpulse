import api from "./api";
import type { Task } from "../store/taskStore";

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: Task["status"];
  priority: Task["priority"];
  labels?: string[];
  assignees?: string[];
  dueDate?: string;
  project?: string;
}

export const taskService = {
  getTasks: (params?: Record<string, string>) => api.get("/tasks", { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: CreateTaskPayload) => api.post("/tasks", data),
  updateTask: (id: string, data: Partial<CreateTaskPayload>) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  moveTask: (id: string, status: Task["status"]) => api.patch(`/tasks/${id}/move`, { status }),
  assignTask: (id: string, userId: string) => api.patch(`/tasks/${id}/assign`, { userId }),
};
