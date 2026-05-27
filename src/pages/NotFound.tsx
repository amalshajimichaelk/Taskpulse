import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-secondary/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg relative z-10"
      >
        {/* Big 404 */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <div className="font-display text-[140px] md:text-[180px] font-black leading-none gradient-text-accent opacity-90 select-none">
            404
          </div>
        </motion.div>

        {/* Floating element */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl mb-8"
        >
          🚀
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Lost in Space
          </h1>
          <p className="text-text-secondary leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to mission control.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              icon={<ArrowLeft size={16} />}
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate("/")}
              icon={<Home size={16} />}
            >
              Mission Control
            </Button>
          </div>
        </motion.div>

        {/* Dots decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2 mt-12"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent-primary/40"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
