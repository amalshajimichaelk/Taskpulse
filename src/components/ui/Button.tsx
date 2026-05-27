import React, { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent-primary text-white hover:bg-accent-primary/90 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] active:shadow-none",
  secondary:
    "bg-surface border border-white/10 text-text-primary hover:bg-surface-2 hover:border-white/20",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-white/5",
  danger:
    "bg-danger/10 border border-danger/25 text-danger hover:bg-danger/20",
  success:
    "bg-success/10 border border-success/25 text-success hover:bg-success/20",
  outline:
    "border border-accent-primary/50 text-accent-primary hover:bg-accent-primary/10",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg h-8",
  md: "px-4 py-2 text-sm rounded-lg h-9",
  lg: "px-6 py-3 text-sm rounded-xl h-11",
  icon: "w-9 h-9 rounded-lg p-0 flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`
          inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed select-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {!loading && icon && iconPosition === "left" && icon}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
