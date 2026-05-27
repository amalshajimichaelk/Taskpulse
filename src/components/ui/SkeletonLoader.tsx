import React from "react";

interface SkeletonProps {
  key?: any;
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export function Skeleton({ className = "", width, height, rounded = "rounded-lg" }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton height="12px" width="40%" />
        <Skeleton height="32px" width="32px" rounded="rounded-lg" />
      </div>
      <Skeleton height="36px" width="60%" />
      <Skeleton height="12px" width="70%" />
    </div>
  );
}

export function SkeletonTaskCard() {
  return (
    <div className="glass-panel rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton height="20px" width="80px" />
        <Skeleton height="20px" width="60px" />
      </div>
      <Skeleton height="14px" width="90%" />
      <Skeleton height="14px" width="75%" />
      <div className="flex gap-2">
        <Skeleton height="22px" width="60px" rounded="rounded-full" />
        <Skeleton height="22px" width="70px" rounded="rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton height="10px" width="40%" />
        <div className="flex -space-x-1">
          {[1, 2].map((i) => (
            <Skeleton key={i} height="24px" width="24px" rounded="rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <Skeleton height="20px" width="40%" />
      <div className="flex items-end gap-2 h-40 pt-4">
        {[60, 80, 50, 90, 70, 85, 65].map((h, i) => (
          <Skeleton key={i} className="flex-1" height={`${h}%`} rounded="rounded-t" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 glass-panel rounded-xl">
          <Skeleton height="40px" width="40px" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="12px" width="50%" />
            <Skeleton height="10px" width="35%" />
          </div>
          <Skeleton height="24px" width="80px" rounded="rounded-full" />
        </div>
      ))}
    </div>
  );
}
