import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  CalendarDays, LineChart, Settings, LogOut, Plus,
  Bell, ChevronLeft, ChevronRight, User, PanelLeft
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { disconnectSocket } from "../hooks/useSocket";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Team", path: "/team", icon: Users },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
  { name: "Analytics", path: "/analytics", icon: LineChart },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  function handleLogout() {
    disconnectSocket();
    logout();
  }

  return (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between mb-8 px-2">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="font-display font-bold text-xl gradient-text-accent tracking-tight whitespace-nowrap">
                TaskPulse
              </h1>
              <p className="text-[9px] text-text-secondary uppercase tracking-[0.2em] mt-0.5">
                Premium Pro
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors flex-none"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Quick Add */}
      <Link
        to="/tasks"
        className={`mb-6 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-semibold hover:bg-accent-primary/20 transition-all duration-200 group ${collapsed ? "justify-center" : ""}`}
      >
        <Plus size={18} className="flex-none group-hover:rotate-90 transition-transform duration-200" />
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              New Task
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          const isNotif = item.name === "Notifications";

          return (
            <Link
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group
                ${isActive
                  ? "bg-accent-primary/12 text-accent-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-accent-primary/12 border border-accent-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex-none">
                <Icon size={19} className={isActive ? "text-accent-primary" : ""} />
              </span>
              {!collapsed && (
                <span className="relative z-10 flex-1 whitespace-nowrap">{item.name}</span>
              )}
              {isNotif && unreadCount > 0 && !collapsed && (
                <Badge variant="danger" size="sm" className="relative z-10 ml-auto">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              {isNotif && unreadCount > 0 && collapsed && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="mt-4 pt-4 border-t border-white/8 space-y-1">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group ${collapsed ? "justify-center" : ""}`}
        >
          {user ? (
            <Avatar name={user.name} size="sm" status="online" className="flex-none" />
          ) : (
            <User size={19} className="text-text-secondary" />
          )}
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-secondary truncate">{user.role}</p>
            </div>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/8 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="flex-none" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 72 : 252 }}
        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
        className="hidden md:flex flex-col h-screen sticky top-0 flex-none bg-bg-secondary border-r border-white/8 shadow-[2px_0_20px_rgba(0,0,0,0.3)] overflow-hidden z-40"
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </motion.div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-bg-secondary border-r border-white/8 z-50 md:hidden overflow-hidden"
            >
              <SidebarContent collapsed={false} onToggle={onMobileClose || (() => {})} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
