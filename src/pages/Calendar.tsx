import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, AlertCircle, FolderOpen, CheckSquare, Loader2 } from "lucide-react";
import { PriorityBadge } from "../components/ui/Badge";
import api from "../services/api";

interface CalEvent {
  id: string;
  title: string;
  fullDate: Date;
  type: "task" | "project";
  priority: "High" | "Medium" | "Low";
  project?: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const priorityDot: Record<CalEvent["priority"], string> = {
  High: "bg-danger",
  Medium: "bg-warning",
  Low: "bg-accent-secondary",
};

export function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks + projects and build calendar events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const built: CalEvent[] = [];

      try {
        const taskRes = await api.get("/tasks", { params: { limit: "200" } });
        const tasks = taskRes.data.tasks || [];
        for (const t of tasks) {
          if (t.dueDate) {
            built.push({
              id: t._id || t.id,
              title: t.title,
              fullDate: new Date(t.dueDate),
              type: "task",
              priority: t.priority || "Medium",
              project: t.project?.name || undefined,
            });
          }
        }
      } catch {
        // silently ignore if tasks fetch fails
      }

      try {
        const projRes = await api.get("/projects");
        const projects = projRes.data.projects || [];
        for (const p of projects) {
          if (p.deadline) {
            built.push({
              id: p._id || p.id,
              title: `📁 ${p.name}`,
              fullDate: new Date(p.deadline),
              type: "project",
              priority: "High",
            });
          }
        }
      } catch {
        // silently ignore if projects fetch fails
      }

      setEvents(built);
      setLoading(false);
    }

    fetchEvents();
  }, []);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: daysInPrev - firstDay + i + 1, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  // Filter events for a specific day in the current viewed month/year
  const eventsForDay = (day: number) =>
    events.filter((e) => {
      const d = e.fullDate;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  // Upcoming events in the currently viewed month from today (or start of month)
  const upcomingEvents = events
    .filter((e) => {
      const d = e.fullDate;
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      return d >= startOfMonth && d <= endOfMonth;
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-header">Calendar</h2>
        <p className="text-sm text-text-secondary">
          {loading ? "Loading your deadlines..." : `${events.length} deadline${events.length !== 1 ? "s" : ""} tracked`}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <Loader2 size={16} className="animate-spin text-accent-primary" />
          Syncing tasks and projects from database...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-text-primary">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); setSelectedDay(now.getDate()); }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-accent-primary/15 text-accent-primary border border-accent-primary/25 hover:bg-accent-primary/25 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-text-secondary uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const dayEvents = cell.current ? eventsForDay(cell.day) : [];
              const isToday = cell.current && cell.day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
              const isSelected = cell.current && cell.day === selectedDay;
              const hasTask = dayEvents.some(e => e.type === "task");
              const hasProject = dayEvents.some(e => e.type === "project");

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: cell.current ? 1.05 : 1 }}
                  onClick={() => cell.current && setSelectedDay(cell.day)}
                  disabled={!cell.current}
                  className={`
                    relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 transition-all text-sm
                    ${!cell.current ? "opacity-20 cursor-default" : "cursor-pointer hover:bg-white/8"}
                    ${isSelected && !isToday ? "bg-accent-primary/15 border border-accent-primary/30" : ""}
                    ${isToday ? "bg-accent-primary text-white glow-indigo font-bold" : "text-text-primary"}
                  `}
                >
                  <span className="text-xs font-semibold">{cell.day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${priorityDot[ev.priority]}`} />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/8">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-danger" /> High priority
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-warning" /> Medium priority
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-secondary" /> Low priority
            </div>
          </div>
        </div>

        {/* Events for selected day */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={16} className="text-accent-primary" />
            <h3 className="section-title">
              {selectedDay ? `${MONTHS[month]} ${selectedDay}, ${year}` : "Select a day"}
            </h3>
          </div>

          <AnimatePresence mode="wait">
            {selectedEvents.length > 0 ? (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {selectedEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-3.5 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {ev.type === "task"
                          ? <CheckSquare size={14} className="text-accent-primary flex-none mt-0.5" />
                          : <FolderOpen size={14} className="text-warning flex-none mt-0.5" />
                        }
                        <p className="text-sm font-semibold text-text-primary leading-snug">{ev.title}</p>
                      </div>
                      <PriorityBadge priority={ev.priority} />
                    </div>
                    <p className="text-xs text-text-secondary pl-6">
                      {ev.type === "task" ? "Task due date" : "Project deadline"}
                      {ev.project ? ` · ${ev.project}` : ""}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <AlertCircle size={20} className="text-text-secondary/50" />
                </div>
                <p className="text-sm text-text-secondary">No deadlines</p>
                <p className="text-xs text-text-secondary/50 mt-1">This day is clear</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* All events in current month */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="section-title mb-5">
          Deadlines in {MONTHS[month]} {year}
        </h3>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl bg-white/4 border border-white/8 hover:border-accent-primary/30 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedDay(ev.fullDate.getDate());
                  setMonth(ev.fullDate.getMonth());
                  setYear(ev.fullDate.getFullYear());
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-accent-primary/15 text-accent-primary">
                    {ev.fullDate.getDate()}
                  </div>
                  <PriorityBadge priority={ev.priority} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  {ev.type === "task"
                    ? <CheckSquare size={12} className="text-accent-primary flex-none" />
                    : <FolderOpen size={12} className="text-warning flex-none" />
                  }
                  <p className="text-sm font-semibold text-text-primary truncate">{ev.title}</p>
                </div>
                <p className="text-xs text-text-secondary">
                  {MONTHS[ev.fullDate.getMonth()]} {ev.fullDate.getDate()}
                  {ev.project ? ` · ${ev.project}` : ""}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-text-secondary">
              {loading ? "Loading..." : "No deadlines set for this month."}
            </p>
            <p className="text-xs text-text-secondary/50 mt-1">
              Create tasks with due dates or projects with deadlines to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
