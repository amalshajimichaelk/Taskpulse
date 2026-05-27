import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, PanelLeft, Command, X, FolderOpen, ClipboardList } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { useThemeStore } from "../store/themeStore";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { disconnectSocket } from "../hooks/useSocket";
import api from "../services/api";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/team": "Team",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
};

interface TopbarProps {
  onMenuClick: () => void;
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

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [profileOpen, setProfileOpen] = useState(false);

  // Autocomplete Search Box States (Google Style)
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageName = pageNames[location.pathname] ?? "TaskPulse";

  // Fetch projects and tasks dynamically on search box focus
  useEffect(() => {
    if (dropdownOpen) {
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
      });
    }
  }, [dropdownOpen]);

  // Click outside search container to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Cmd + K / Ctrl + K to focus search bar)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setDropdownOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prefix matching search matching & sorting algorithm (Google style autocomplete)
  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aStartsWith = a.name?.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
    const bStartsWith = b.name?.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
    return bStartsWith - aStartsWith; // startsWith matches bubble to the top
  }).slice(0, 3);

  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aStartsWith = a.title?.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
    const bStartsWith = b.title?.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
    return bStartsWith - aStartsWith; // startsWith matches bubble to the top
  }).slice(0, 5);

  const hasResults = filteredProjects.length > 0 || filteredTasks.length > 0;

  function handleSelectProject(projId: string) {
    setDropdownOpen(false);
    setSearchQuery("");
    inputRef.current?.blur();
    navigate("/projects");
  }

  function handleSelectTask(taskId: string) {
    setDropdownOpen(false);
    setSearchQuery("");
    inputRef.current?.blur();
    navigate("/tasks");
  }

  function handleLogout() {
    disconnectSocket();
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-6 h-16 bg-bg-primary/80 backdrop-blur-xl border-b border-white/8">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors"
        aria-label="Open menu"
      >
        <PanelLeft size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.h2
            key={location.pathname}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="font-display text-lg font-bold text-text-primary hidden md:block"
          >
            {pageName}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Autocomplete Search input (Google Style) */}
      <div className="hidden md:block relative w-72" ref={searchRef}>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/50 border border-white/10 rounded-xl hover:border-white/20 focus-within:border-accent-primary/50 focus-within:bg-surface/80 transition-all duration-200">
          <Search size={14} className="text-text-secondary flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-text-secondary/40 py-0.5"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-text-secondary hover:text-text-primary p-0.5 rounded-md hover:bg-white/8 transition-colors flex-none"
            >
              <X size={12} />
            </button>
          ) : (
            <div className="flex items-center gap-0.5 text-text-secondary/40 select-none flex-none">
              <Command size={10} />
              <span className="text-[9px] font-medium">K</span>
            </div>
          )}
        </div>

        {/* Dropdown Suggestions panel */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-50 max-h-[380px] overflow-y-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-text-secondary text-xs">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border border-accent-primary border-t-transparent" />
                  <span>Searching workspace...</span>
                </div>
              ) : searchQuery === "" ? (
                // Suggested Recent shortcuts when search input is empty
                <div className="p-2 space-y-3">
                  {projects.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-secondary/60 px-2 py-1.5">Projects</h4>
                      <div className="flex flex-col gap-0.5">
                        {projects.slice(0, 3).map(p => (
                          <button
                            key={p.id || p._id}
                            type="button"
                            onClick={() => handleSelectProject(p.id || p._id || "")}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-all group"
                          >
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-none" style={{ backgroundColor: `${p.color || "#6366F1"}15`, color: p.color || "#6366F1", border: `1px solid ${p.color || "#6366F1"}20` }}>
                              <FolderOpen size={11} />
                            </div>
                            <span className="text-xs font-medium text-text-primary truncate group-hover:text-accent-primary transition-colors">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-secondary/60 px-2 py-1.5">Recent Tasks</h4>
                      <div className="flex flex-col gap-0.5">
                        {tasks.slice(0, 4).map(t => (
                          <button
                            key={t._id || t.id}
                            type="button"
                            onClick={() => handleSelectTask(t._id)}
                            className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ClipboardList size={12} className="text-text-secondary flex-none" />
                              <span className="text-xs text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">{t.title}</span>
                            </div>
                            <span className="text-[9px] font-mono text-text-secondary/40 shrink-0">{t.id || `#${t._id.slice(-4)}`}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : hasResults ? (
                // Dynamic prefix-priority matching results when user types letters
                <div className="p-2 space-y-3">
                  {filteredProjects.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-secondary/60 px-2 py-1.5">Projects</h4>
                      <div className="flex flex-col gap-0.5">
                        {filteredProjects.map(p => (
                          <button
                            key={p.id || p._id}
                            type="button"
                            onClick={() => handleSelectProject(p.id || p._id || "")}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-all group"
                          >
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-none" style={{ backgroundColor: `${p.color || "#6366F1"}15`, color: p.color || "#6366F1", border: `1px solid ${p.color || "#6366F1"}20` }}>
                              <FolderOpen size={11} />
                            </div>
                            <span className="text-xs font-medium text-text-primary truncate group-hover:text-accent-primary transition-colors">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredTasks.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-secondary/60 px-2 py-1.5">Tasks</h4>
                      <div className="flex flex-col gap-0.5">
                        {filteredTasks.map(t => (
                          <button
                            key={t._id || t.id}
                            type="button"
                            onClick={() => handleSelectTask(t._id)}
                            className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-left hover:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ClipboardList size={12} className="text-text-secondary flex-none" />
                              <span className="text-xs text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">{t.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-none">
                              <span className={`text-[8px] uppercase font-extrabold px-1 rounded flex-none ${t.priority === "High" ? "bg-danger/15 text-danger" : t.priority === "Medium" ? "bg-warning/15 text-warning" : "bg-text-secondary/15 text-text-secondary"}`}>{t.priority}</span>
                              <span className="text-[9px] font-mono text-text-secondary/40 shrink-0 flex-none">{t.id || `#${t._id.slice(-4)}`}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <ClipboardList size={22} className="text-text-secondary/30 mb-1" />
                  <p className="text-xs font-semibold text-text-primary">No results found</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">No projects or tasks matching "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors"
          title="Toggle theme"
          aria-label="Toggle dark/light mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-[9px] text-white font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Link>

        {/* Profile dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-white/8 transition-colors"
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            {user && <Avatar name={user.name} size="sm" status="online" />}
            <ChevronDown
              size={14}
              className={`text-text-secondary transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {user && (
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                    <Badge variant="primary" size="sm" className="mt-1.5">{user.role}</Badge>
                  </div>
                )}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  >
                    <Settings size={15} /> Settings
                  </Link>
                  <hr className="border-white/8 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/8 transition-colors"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
