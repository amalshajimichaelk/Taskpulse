import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authService } from "../services/authService";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";

function ForgotPasswordContent() {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      success("Code sent!", "Check your email for the OTP.");
    } catch {
      // Don't reveal if email exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/login" className="font-display text-2xl font-black gradient-text-accent">TaskPulse</Link>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} className="text-accent-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-text-primary">Forgot password?</h2>
                  <p className="text-sm text-text-secondary mt-2">Enter your email and we'll send you a reset code.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail size={14} />}
                    required
                    autoFocus
                  />
                  <Button type="submit" loading={loading} className="w-full" size="lg" icon={<ArrowRight size={16} />} iconPosition="right">
                    Send Reset Code
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={28} className="text-success" />
                </motion.div>
                <h3 className="font-display text-xl font-bold text-text-primary mb-2">Check your email</h3>
                <p className="text-sm text-text-secondary mb-6">
                  We've sent a 6-digit OTP to <span className="text-text-primary font-medium">{email}</span>
                </p>
                <Link to="/otp">
                  <Button className="w-full" size="lg">
                    Enter OTP Code →
                  </Button>
                </Link>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="mt-3 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Try a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Link to="/login" className="flex items-center justify-center gap-1.5 mt-6 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function ForgotPassword() {
  return (
    <ToastProvider>
      <ForgotPasswordContent />
    </ToastProvider>
  );
}
