import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { ToastProvider } from "../components/ui/Toast";
import { useSocket } from "../hooks/useSocket";
import { NewTaskModal } from "../components/NewTaskModal";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutDashboard, FolderKanban, CheckSquare, Users, CalendarDays } from "lucide-react";

const mobileNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/projects", icon: FolderKanban, label: "Projects" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/team", icon: Users, label: "Team" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
];

function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-white/8 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${isActive ? "text-accent-primary" : "text-text-secondary"}`}
            >
              <div className="relative">
                <Icon size={22} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const location = useLocation();

  // Initialize Socket.IO connection
  useSocket();

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary">
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto relative">
            {/* Subtle background mesh */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/4 rounded-full blur-3xl" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative z-10 p-4 md:p-8 pb-24 md:pb-8"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />

        {/* Floating Quick Action Button — opens New Task modal */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNewTaskOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.5)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.65)] transition-all duration-300 group z-50 glow-indigo"
          title="New Task"
          aria-label="Create new task"
        >
          <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>

        {/* New Task Modal — triggered globally from the FAB */}
        <NewTaskModal
          isOpen={newTaskOpen}
          onClose={() => setNewTaskOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
