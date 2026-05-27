import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { ToastProvider } from "../components/ui/Toast";

const FEATURES = [
  { icon: Zap, title: "Real-time Collaboration", desc: "Live task updates across your team" },
  { icon: CheckCircle2, title: "Smart Kanban Board", desc: "Drag-and-drop workflow management" },
  { icon: TrendingUp, title: "Analytics Dashboard", desc: "Track productivity and team performance" },
  { icon: Users, title: "Team Management", desc: "Roles, permissions, and workload visibility" },
];

function LoginContent() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { success, error } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);

    try {
      const res = await authService.login(form);
      const { user, token, refreshToken } = res.data;
      setAuth(user, token, refreshToken);
      success("Welcome back!", `Good to see you, ${user.name}!`);
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid credentials. Please try again.";
      error("Login failed", msg);
    } finally {
      setLoading(false);
    }
  }

  // Demo login bypass
  async function handleDemoLogin() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setAuth(
      { _id: "000000000000000000000000", name: "Alex Demo", email: "demo@taskpulse.io", role: "Project Manager", bio: "Demo user — explore all features!" },
      "demo-token",
      "demo-refresh"
    );
    success("Demo mode activated!", "Explore TaskPulse with full access.");
    navigate("/");
    setLoading(false);
  }

  return (
    <div className="min-h-screen auth-bg flex overflow-hidden">
      {/* Left Panel — Features */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-center p-14 flex-1 relative overflow-hidden"
      >
        {/* Background orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-primary/12 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent-secondary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-display text-5xl font-black gradient-text-accent mb-2">TaskPulse</h1>
            <p className="text-sm text-text-secondary uppercase tracking-[0.25em] mb-10">Premium Pro</p>
            <p className="text-2xl font-bold text-text-primary leading-snug mb-10">
              The modern workspace for high-performing teams.
            </p>
          </motion.div>

          <div className="space-y-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center flex-none">
                    <Icon size={18} className="text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{f.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 p-5 glass-panel rounded-2xl"
          >
            <p className="text-sm text-text-secondary italic leading-relaxed">
              "TaskPulse transformed how our team collaborates. Productivity is up 40% in just one quarter."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-bold">S</div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Sarah Mitchell</p>
                <p className="text-[10px] text-text-secondary">CTO, Nexus Labs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel — Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center w-full lg:w-[480px] flex-none p-6"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl font-black gradient-text-accent">TaskPulse</h1>
          </div>

          <div className="glass-panel rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-text-primary">Welcome back</h2>
              <p className="text-sm text-text-secondary mt-1">Sign in to your workspace</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} leftIcon={<Mail size={14} />} required autoComplete="email" />
              <Input label="Password" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} leftIcon={<Lock size={14} />} rightIcon={showPass ? <EyeOff size={14} /> : <Eye size={14} />} onRightIconClick={() => setShowPass(!showPass)} required autoComplete="current-password" />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-accent-primary hover:underline">Forgot password?</Link>
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg" icon={<ArrowRight size={16} />} iconPosition="right">
                Sign In
              </Button>
            </form>

            <div className="relative my-4">
              <hr className="border-white/8" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1E293B] px-3 text-xs text-text-secondary">or</span>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin} loading={loading}>
              🚀 Try Demo Mode
            </Button>

            <p className="text-center text-sm text-text-secondary mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent-primary font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Login() {
  return (
    <ToastProvider>
      <LoginContent />
    </ToastProvider>
  );
}
