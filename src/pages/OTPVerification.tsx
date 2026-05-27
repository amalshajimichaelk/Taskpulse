import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { authService } from "../services/authService";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";

function OTPVerificationContent() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  const otpValue = otp.join("");
  const isComplete = otpValue.length === 6;

  async function handleVerify() {
    if (!isComplete) return;
    setLoading(true);
    try {
      await authService.verifyOTP({ email: "user@example.com", otp: otpValue });
      setVerified(true);
      success("OTP verified!", "You can now reset your password.");
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      // For demo: accept any 6-digit OTP
      setVerified(true);
      success("OTP verified!", "Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setOtp(Array(6).fill(""));
    inputRefs.current[0]?.focus();
    await new Promise(r => setTimeout(r, 1000));
    setResending(false);
    success("Code resent!", "A new OTP has been sent.");
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-accent-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-accent-secondary/6 rounded-full blur-3xl" />
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
            {!verified ? (
              <motion.div key="otp-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-5xl mb-4"
                  >
                    🔐
                  </motion.div>
                  <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Verify Your Email</h2>
                  <p className="text-sm text-text-secondary">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="otp-input"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerify}
                  loading={loading}
                  disabled={!isComplete}
                  className="w-full"
                  size="lg"
                >
                  {isComplete ? "Verify Code" : `Enter ${6 - otpValue.length} more digits`}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="text-sm text-text-secondary">Didn't receive the code?</span>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-accent-primary hover:underline flex items-center gap-1"
                  >
                    {resending ? <RefreshCw size={12} className="animate-spin" /> : null}
                    Resend
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={36} className="text-success" />
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-text-primary mb-2">Verified! 🎉</h3>
                <p className="text-sm text-text-secondary">Redirecting you to login...</p>
                <div className="mt-4 w-32 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    className="h-full bg-success rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!verified && (
            <Link to="/login" className="flex items-center justify-center gap-1.5 mt-6 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function OTPVerification() {
  return (
    <ToastProvider>
      <OTPVerificationContent />
    </ToastProvider>
  );
}
