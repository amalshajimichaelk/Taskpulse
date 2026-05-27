import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, MoreVertical, Mail, Shield } from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { Badge, RoleBadge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Project Manager" | "Team Member" | "Viewer";
  jobTitle: string;
  projects: number;
  bandwidth: number;
  tasksDone: number;
  tasksTotal: number;
  status: "online" | "offline" | "busy" | "away";
  joinedAt: string;
}

const MOCK_TEAM: TeamMember[] = [
  { id: "1", name: "Elena Rostova", email: "elena@taskpulse.io", role: "Team Member", jobTitle: "Lead UI/UX Designer", projects: 4, bandwidth: 85, tasksDone: 24, tasksTotal: 28, status: "online", joinedAt: "2025-01-12" },
  { id: "2", name: "Marcus Chen", email: "marcus@taskpulse.io", role: "Admin", jobTitle: "Senior Backend Engineer", projects: 3, bandwidth: 40, tasksDone: 18, tasksTotal: 22, status: "online", joinedAt: "2024-08-05" },
  { id: "3", name: "Sarah Jenkins", email: "sarah@taskpulse.io", role: "Project Manager", jobTitle: "Product Manager", projects: 6, bandwidth: 98, tasksDone: 31, tasksTotal: 32, status: "busy", joinedAt: "2024-11-20" },
  { id: "4", name: "Alex Kim", email: "alex@taskpulse.io", role: "Team Member", jobTitle: "Frontend Developer", projects: 2, bandwidth: 55, tasksDone: 14, tasksTotal: 20, status: "away", joinedAt: "2026-01-03" },
  { id: "5", name: "Jordan Lee", email: "jordan@taskpulse.io", role: "Viewer", jobTitle: "Intern", projects: 1, bandwidth: 20, tasksDone: 5, tasksTotal: 8, status: "offline", joinedAt: "2026-03-15" },
];

export function Team() {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_TEAM);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Team Member" });
  const [inviting, setInviting] = useState(false);
  const { success, error } = useToast();

  const filtered = members.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;
    setInviting(true);
    try {
      const res = await api.post("/auth/invite", {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
      });

      success("Invitation sent!", res.data.message || `${inviteForm.email} will receive an invite email.`);

      setInviteOpen(false);
      setInviteForm({ email: "", role: "Team Member" });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send invitation. Please try again.";
      error("Invite failed", msg);
    } finally {
      setInviting(false);
    }
  }


  const onlineCount = members.filter((m) => m.status === "online").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-header">Team Management</h2>
          <p className="text-sm text-text-secondary">
            {members.length} members · <span className="text-success">{onlineCount} online</span>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-3.5 h-3.5" />
            <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 text-xs w-full md:w-52" />
          </div>
          <Button icon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)}>Invite</Button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((member, i) => {
          const completionPct = Math.round((member.tasksDone / member.tasksTotal) * 100);
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel p-6 rounded-2xl relative group hover:shadow-[0_8px_32px_rgba(99,102,241,0.12)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-5">
                <Avatar name={member.name} size="lg" status={member.status} />
                <button className="text-text-secondary/0 group-hover:text-text-secondary hover:text-text-primary transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="mb-5">
                <h3 className="font-bold text-lg text-text-primary">{member.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">{member.jobTitle}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <RoleBadge role={member.role} />
                  <Badge variant="default" size="sm" dot className={member.status === "online" ? "!text-success !border-success/25" : ""}>
                    {member.status}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5 py-3 border-y border-white/8">
                <div className="text-center">
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-0.5">Projects</p>
                  <p className="font-bold text-text-primary text-xl">{member.projects}</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-0.5">Tasks Done</p>
                  <p className="font-bold text-text-primary text-xl">{member.tasksDone}</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-0.5">Bandwidth</p>
                  <p className={`font-bold text-xl ${member.bandwidth > 90 ? "text-danger" : member.bandwidth > 70 ? "text-warning" : "text-success"}`}>
                    {member.bandwidth}%
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                  <span>Completion Rate</span>
                  <span className="font-bold text-text-primary">{completionPct}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill"
                    style={{ background: member.bandwidth > 90 ? "#EF4444" : member.bandwidth > 70 ? "#F59E0B" : "#10B981" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 + 0.3 }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary">
                <Mail size={11} />
                <span className="truncate">{member.email}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member" description="Send an invitation via email" size="sm">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input label="Email Address *" type="email" placeholder="colleague@company.com" value={inviteForm.email} onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))} leftIcon={<Mail size={14} />} autoFocus required />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Shield size={12} /> Role</label>
            <select value={inviteForm.role} onChange={(e) => setInviteForm(f => ({ ...f, role: e.target.value }))}>
              <option value="Viewer">Viewer</option>
              <option value="Team Member">Team Member</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setInviteOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={inviting} className="flex-1" icon={<UserPlus size={14} />}>Send Invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
