import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useTaskStore } from "../store/taskStore";
import { useNotificationStore } from "../store/notificationStore";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const { moveTask, addTask, updateTask, deleteTask } = useTaskStore();
  const { addNotification } = useNotificationStore();
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (!socketInstance) {
      socketInstance = io("/", {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
      });
    }

    if (!listenersAttached.current) {
      listenersAttached.current = true;

      socketInstance.on("connect", () => {
        console.log("[Socket] Connected:", socketInstance?.id);
      });

      socketInstance.on("task:created", (task) => {
        addTask(task);
      });

      socketInstance.on("task:updated", ({ id, updates }) => {
        updateTask(id, updates);
      });

      socketInstance.on("task:moved", ({ id, status }) => {
        moveTask(id, status);
      });

      socketInstance.on("task:deleted", ({ id }) => {
        deleteTask(id);
      });

      socketInstance.on("notification:new", (notification) => {
        addNotification(notification);
      });

      socketInstance.on("disconnect", () => {
        console.log("[Socket] Disconnected");
      });
    }

    return () => {
      // Don't disconnect on unmount — keep connection alive
    };
  }, [isAuthenticated, token]);

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
