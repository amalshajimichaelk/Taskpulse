import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";

const PERKS = [
  "Unlimited projects & tasks",
  "Real-time team collaboration",
  "Advanced analytics & reporting",
  "Priority customer support",
];

function SignupContent() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { success, error } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await authService.register({ name: form.name, email: form.email, password: form.password });
      const { user, token, refreshToken } = res.data;
      setAuth(user, token, refreshToken);
      success("Account created!", `Welcome to TaskPulse, ${user.name}!`);
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed. Try again.";
      error("Signup failed", msg);
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-danger", "bg-warning", "bg-success"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-screen auth-bg flex overflow-hidden">
      {/* Left decorative panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-center items-center p-14 flex-1 relative overflow-hidden"
      >
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-28 h-28 rounded-3xl gradient-primary mx-auto mb-8 flex items-center justify-center shadow-[0_20px_60px_rgba(99,102,241,0.4)] animate-float"
          >
            <span className="text-5xl">⚡</span>
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-text-primary mb-3">Start for free</h2>
          <p className="text-text-secondary mb-10">No credit card required. Cancel anytime.</p>

          <div className="space-y-3 text-left">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 size={18} className="text-success flex-none" />
                <span className="text-sm text-text-secondary">{perk}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-10 glass-panel rounded-2xl p-5 text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              {["E", "M", "S", "A"].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold -ml-1 first:ml-0 border-2 border-bg-primary">
                  {l}
                </div>
              ))}
              <span className="text-xs text-text-secondary ml-1">+1.2k teams</span>
            </div>
            <p className="text-xs text-text-secondary">Join thousands of teams already shipping faster.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel — Signup Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center w-full lg:w-[500px] flex-none p-6"
      >
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl font-black gradient-text-accent">TaskPulse</h1>
          </div>

          <div className="glass-panel rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-text-primary">Create account</h2>
              <p className="text-sm text-text-secondary mt-1">Start your 14-day free trial</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                leftIcon={<User size={14} />}
                error={errors.name}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="alex@company.com"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                leftIcon={<Mail size={14} />}
                error={errors.email}
                required
              />
              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  leftIcon={<Lock size={14} />}
                  rightIcon={showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  onRightIconClick={() => setShowPass(!showPass)}
                  error={errors.password}
                  required
                />
                {form.password && (
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-white/10"}`}
                      />
                    ))}
                    <span className={`text-[10px] font-medium ${strengthColors[passwordStrength].replace("bg-", "text-")}`}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>
              <Input
                label="Confirm Password"
                type={showPass ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
                leftIcon={<Lock size={14} />}
                error={errors.confirm}
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg" icon={<ArrowRight size={16} />} iconPosition="right">
                Create Account
              </Button>
            </form>

            <p className="text-center text-xs text-text-secondary mt-4">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-accent-primary hover:underline">Terms of Service</a>
            </p>

            <p className="text-center text-sm text-text-secondary mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-accent-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Signup() {
  return (
    <ToastProvider>
      <SignupContent />
    </ToastProvider>
  );
}
