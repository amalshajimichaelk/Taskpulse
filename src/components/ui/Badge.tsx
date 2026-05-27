import React from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
type PriorityLevel = "High" | "Medium" | "Low";
type StatusType = "Todo" | "In Progress" | "Review" | "Completed";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-text-secondary border-white/10",
  primary: "bg-accent-primary/15 text-accent-primary border-accent-primary/25",
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-danger/15 text-danger border-danger/25",
  info: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/25",
  outline: "bg-transparent text-text-secondary border-white/20",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-secondary",
  primary: "bg-accent-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-accent-secondary",
  outline: "bg-text-secondary",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({ children, variant = "default", className = "", dot = false, size = "md" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full border
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const map: Record<PriorityLevel, { variant: BadgeVariant; icon: string }> = {
    High: { variant: "danger", icon: "↑" },
    Medium: { variant: "warning", icon: "→" },
    Low: { variant: "default", icon: "↓" },
  };
  const { variant, icon } = map[priority] ?? { variant: "default", icon: "–" };
  return (
    <Badge variant={variant} size="sm" dot>
      {icon} {priority}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: StatusType }) {
  const map: Record<StatusType, BadgeVariant> = {
    "Todo": "default",
    "In Progress": "info",
    "Review": "warning",
    "Completed": "success",
  };
  return (
    <Badge variant={map[status] ?? "default"} size="sm" dot>
      {status}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeVariant> = {
    Admin: "danger",
    "Project Manager": "primary",
    "Team Member": "info",
    Viewer: "default",
  };
  return <Badge variant={map[role] ?? "default"}>{role}</Badge>;
}
