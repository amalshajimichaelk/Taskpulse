import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Globe, Save, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export function Settings() {
  const { user, setUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: true,
    taskCompleted: true,
    deadlineReminder: true,
    teamUpdates: false,
    emailDigest: true,
  });

  const [passForm, setPassForm] = useState({ current: "", new: "", confirm: "" });

  async function handleProfileSave() {
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", {
        name: profileForm.name,
        bio: profileForm.bio,
      });
      // Update local auth store with the saved data
      if (user) setUser({ ...user, name: profileForm.name, bio: profileForm.bio });
      success("Profile updated!", "Your changes have been saved.");
    } catch (err: any) {
      error("Update failed", err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePassSave(e: React.FormEvent) {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      error("Passwords don't match", "Please check your confirmation password.");
      return;
    }
    if (passForm.new.length < 6) {
      error("Password too short", "Password must be at least 6 characters.");
      return;
    }
    
    try {
      setSaving(true);
      await api.patch("/auth/update-password", {
        currentPassword: passForm.current,
        newPassword: passForm.new
      });
      success("Password updated!", "Your password has been changed securely.");
      setPassForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      error("Update failed", err.response?.data?.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-header">Settings</h2>
        <p className="text-sm text-text-secondary">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs */}
        <div className="flex md:flex-col gap-1 md:w-52 flex-shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                  ${isActive
                    ? "bg-accent-primary/15 border border-accent-primary/25 text-accent-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 space-y-6">
              <h3 className="section-title border-b border-white/8 pb-4">Profile Information</h3>

              {/* Avatar section */}
              <div className="flex items-center gap-5">
                {user && <Avatar name={user.name} size="xl" status="online" />}
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-1">{user?.name || "Your Name"}</p>
                  <p className="text-xs text-text-secondary mb-3">{user?.role}</p>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                <Input label="Email Address" type="email" value={profileForm.email} onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Bio</label>
                <textarea rows={3} placeholder="Tell your team about yourself..." className="resize-none" value={profileForm.bio} onChange={(e) => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
              </div>

              <Button onClick={handleProfileSave} loading={saving} icon={<Save size={15} />}>
                Save Profile
              </Button>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 space-y-6">
              <h3 className="section-title border-b border-white/8 pb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "taskAssigned", label: "Task Assigned", desc: "Notify when a task is assigned to me" },
                  { key: "taskCompleted", label: "Task Completed", desc: "Notify when my tasks are marked complete" },
                  { key: "deadlineReminder", label: "Deadline Reminders", desc: "24h reminders before task deadlines" },
                  { key: "teamUpdates", label: "Team Updates", desc: "Notifications about team member activity" },
                  { key: "emailDigest", label: "Email Digest", desc: "Weekly summary email every Monday" },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/8">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{pref.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key as keyof typeof p] }))}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${notifPrefs[pref.key as keyof typeof notifPrefs] ? "bg-accent-primary" : "bg-white/15"}`}
                      role="switch"
                      aria-checked={notifPrefs[pref.key as keyof typeof notifPrefs]}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${notifPrefs[pref.key as keyof typeof notifPrefs] ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <Button icon={<Save size={15} />} onClick={() => success("Preferences saved!")}>Save Preferences</Button>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 space-y-6">
              <h3 className="section-title border-b border-white/8 pb-4">Change Password</h3>
              <form onSubmit={handlePassSave} className="space-y-4 max-w-md">
                <Input label="Current Password" type={showPass ? "text" : "password"} value={passForm.current} onChange={(e) => setPassForm(p => ({ ...p, current: e.target.value }))} rightIcon={showPass ? <EyeOff size={14} /> : <Eye size={14} />} onRightIconClick={() => setShowPass(!showPass)} />
                <Input label="New Password" type={showPass ? "text" : "password"} value={passForm.new} onChange={(e) => setPassForm(p => ({ ...p, new: e.target.value }))} hint="Minimum 6 characters" />
                <Input label="Confirm New Password" type={showPass ? "text" : "password"} value={passForm.confirm} onChange={(e) => setPassForm(p => ({ ...p, confirm: e.target.value }))} error={passForm.confirm && passForm.new !== passForm.confirm ? "Passwords don't match" : undefined} />
                <Button type="submit" icon={<Shield size={15} />}>Update Password</Button>
              </form>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 space-y-6">
              <h3 className="section-title border-b border-white/8 pb-4">Appearance</h3>
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">Choose your preferred color theme</p>
                <div className="grid grid-cols-2 gap-4 max-w-xs">
                  <button
                    onClick={() => { if (isDark) toggleTheme(); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${!isDark ? "border-accent-primary bg-accent-primary/10" : "border-white/10 hover:border-white/25"}`}
                  >
                    <Sun size={24} className="text-warning" />
                    <span className="text-xs font-medium text-text-primary">Light</span>
                  </button>
                  <button
                    onClick={() => { if (!isDark) toggleTheme(); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isDark ? "border-accent-primary bg-accent-primary/10" : "border-white/10 hover:border-white/25"}`}
                  >
                    <Moon size={24} className="text-accent-primary" />
                    <span className="text-xs font-medium text-text-primary">Dark</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
