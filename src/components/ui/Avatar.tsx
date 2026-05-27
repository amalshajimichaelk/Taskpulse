import React from "react";

interface AvatarProps {
  key?: any;
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
  src?: string;
}

const sizeMap = {
  xs: { div: "w-6 h-6 text-[9px]", dot: "w-2 h-2 border" },
  sm: { div: "w-8 h-8 text-[10px]", dot: "w-2.5 h-2.5 border" },
  md: { div: "w-10 h-10 text-xs", dot: "w-3 h-3 border-[1.5px]" },
  lg: { div: "w-12 h-12 text-sm", dot: "w-3.5 h-3.5 border-2" },
  xl: { div: "w-16 h-16 text-base", dot: "w-4 h-4 border-2" },
};

const statusColors = {
  online: "bg-success",
  offline: "bg-text-secondary",
  busy: "bg-danger",
  away: "bg-warning",
};

// Generate a deterministic color for each name
function nameToColor(name: string): string {
  const colors = [
    "from-violet-500 to-indigo-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
    "from-purple-500 to-violet-500",
    "from-indigo-500 to-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = "md", status, className = "", src }: AvatarProps) {
  const s = sizeMap[size];
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const gradient = nameToColor(name);

  return (
    <div className={`relative inline-flex flex-none ${className}`}>
      <div
        className={`${s.div} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md`}
        title={name}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${s.dot} rounded-full border-bg-primary ${statusColors[status]}`}
          title={status}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  names,
  size = "sm",
  max = 4,
}: {
  names: string[];
  size?: AvatarProps["size"];
  max?: number;
}) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;
  const offsetMap = { xs: "-ml-1", sm: "-ml-1.5", md: "-ml-2", lg: "-ml-2.5", xl: "-ml-3" };
  const overflowSize = { xs: "w-6 h-6 text-[9px]", sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-12 h-12 text-sm", xl: "w-16 h-16 text-base" };

  return (
    <div className="flex">
      {visible.map((name, i) => (
        <Avatar
          key={i}
          name={name}
          size={size}
          className={i > 0 ? `${offsetMap[size!]} border-2 border-bg-primary` : "border-2 border-bg-primary"}
        />
      ))}
      {overflow > 0 && (
        <div
          className={`${overflowSize[size!]} ${offsetMap[size!]} rounded-full bg-surface border-2 border-bg-primary flex items-center justify-center text-text-secondary font-bold`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
