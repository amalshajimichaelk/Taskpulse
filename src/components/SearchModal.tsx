import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, ClipboardList, X } from "lucide-react";
import { Modal } from "./ui/Modal";
import api from "../services/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectItem {
  id: string;
  _id?: string;
  name: string;
  description: string;
  color: string;
}

interface TaskItem {
  _id: string;
  id?: string;
  title: string;
  status: string;
  priority: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch projects and tasks on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setLoading(true);
      Promise.all([
        api.get("/projects").catch(() => ({ data: { projects: [] } })),
        api.get("/tasks").catch(() => ({ data: { tasks: [] } }))
      ]).then(([projRes, taskRes]) => {
        const projs = projRes.data.projects || projRes.data || [];
        const tskList = taskRes.data.tasks || taskRes.data || [];
        setProjects(projs);
        setTasks(tskList);
      }).finally(() => {
        setLoading(false);
        // Autofocus input
        setTimeout(() => inputRef.current?.focus(), 150);
      });
    }
  }, [isOpen]);

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(query.toLowerCase()) || 
    p.description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(query.toLowerCase()) ||
    t.id?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const hasResults = filteredProjects.length > 0 || filteredTasks.length > 0;

  function handleSelectProject(projId: string) {
    onClose();
    navigate("/projects");
  }

  function handleSelectTask(taskId: string) {
    onClose();
    navigate("/tasks");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} size="lg">
      <div className="flex flex-col gap-4">
        {/* Search header input */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white/4 border border-white/10 rounded-xl">
          <Search className="text-text-secondary w-5 h-5 flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search projects or tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm placeholder-text-secondary/50 py-1"
          />
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors flex-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search results */}
        <div className="mt-2 max-h-[350px] overflow-y-auto pr-1 space-y-5">
          {loading ? (
            <div className="flex flex-col gap-2 py-6 items-center justify-center text-text-secondary text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent-primary border-t-transparent" />
              <span>Fetching workspace content...</span>
            </div>
          ) : query === "" ? (
            // Suggestions
            <div className="space-y-4">
              {projects.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2 px-1">Suggested Projects</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {projects.slice(0, 4).map(p => (
                      <div 
                        key={p.id || p._id} 
                        onClick={() => handleSelectProject(p.id || p._id || "")}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/5 hover:border-white/15 hover:bg-white/8 transition-all cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-none" style={{ backgroundColor: `${p.color || "#6366F1"}15`, color: p.color || "#6366F1", border: `1px solid ${p.color || "#6366F1"}25` }}>
                          <FolderOpen size={14} />
                        </div>
                        <span className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2 px-1">Recent Tasks</h4>
                  <div className="flex flex-col gap-2">
                    {tasks.slice(0, 3).map(t => (
                      <div 
                        key={t._id || t.id} 
                        onClick={() => handleSelectTask(t._id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/5 hover:border-white/15 hover:bg-white/8 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ClipboardList size={14} className="text-text-secondary flex-none" />
                          <span className="text-sm text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary/50 shrink-0">{t.id || `#${t._id.slice(-4)}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : hasResults ? (
            <div className="space-y-4">
              {/* Match projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2 px-1">Projects ({filteredProjects.length})</h4>
                  <div className="flex flex-col gap-2">
                    {filteredProjects.map(p => (
                      <div 
                        key={p.id || p._id} 
                        onClick={() => handleSelectProject(p.id || p._id || "")}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/5 hover:border-white/15 hover:bg-white/8 transition-all cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-none" style={{ backgroundColor: `${p.color || "#6366F1"}15`, color: p.color || "#6366F1", border: `1px solid ${p.color || "#6366F1"}25` }}>
                          <FolderOpen size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">{p.name}</p>
                          <p className="text-xs text-text-secondary truncate mt-0.5">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match tasks */}
              {filteredTasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2 px-1">Tasks ({filteredTasks.length})</h4>
                  <div className="flex flex-col gap-2">
                    {filteredTasks.map(t => (
                      <div 
                        key={t._id || t.id} 
                        onClick={() => handleSelectTask(t._id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/5 hover:border-white/15 hover:bg-white/8 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ClipboardList size={14} className="text-text-secondary flex-none" />
                          <span className="text-sm text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${t.priority === "High" ? "bg-danger/15 text-danger" : t.priority === "Medium" ? "bg-warning/15 text-warning" : "bg-text-secondary/15 text-text-secondary"}`}>{t.priority}</span>
                          <span className="text-[10px] font-mono text-text-secondary/50 shrink-0">{t.id || `#${t._id.slice(-4)}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList size={32} className="text-text-secondary/35 mb-2" />
              <p className="text-sm font-semibold text-text-primary">No results found</p>
              <p className="text-xs text-text-secondary mt-1">We couldn't find any projects or tasks matching "{query}"</p>
            </div>
          )}
        </div>

        {/* Global hotkey info footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-text-secondary/50">
          <span>Search in real time across the workspace</span>
          <span className="hidden sm:block">Press <kbd className="bg-white/8 px-1.5 py-0.5 rounded text-[9px] border border-white/10 font-sans">ESC</kbd> to close</span>
        </div>
      </div>
    </Modal>
  );
}
