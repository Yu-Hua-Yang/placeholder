"use client";

import MeasuringMate from "./MeasuringMate";

type Pose = "idle" | "wave" | "run" | "search" | "present" | "think";

interface MascotBadgeProps {
  pose?: Pose;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const POSE_COLORS: Record<Pose, { bg: string; ring: string }> = {
  idle: { bg: "bg-blue-50 dark:bg-blue-950/40", ring: "ring-blue-200/50 dark:ring-blue-800/30" },
  wave: { bg: "bg-blue-50 dark:bg-blue-950/40", ring: "ring-blue-200/50 dark:ring-blue-800/30" },
  search: { bg: "bg-amber-50 dark:bg-amber-950/40", ring: "ring-amber-200/50 dark:ring-amber-800/30" },
  think: { bg: "bg-violet-50 dark:bg-violet-950/40", ring: "ring-violet-200/50 dark:ring-violet-800/30" },
  run: { bg: "bg-emerald-50 dark:bg-emerald-950/40", ring: "ring-emerald-200/50 dark:ring-emerald-800/30" },
  present: { bg: "bg-sky-50 dark:bg-sky-950/40", ring: "ring-sky-200/50 dark:ring-sky-800/30" },
};

const SIZE_MAP = {
  sm: { badge: "h-10 w-10", mascot: "w-7" },
  md: { badge: "h-14 w-14", mascot: "w-10" },
  lg: { badge: "h-20 w-20", mascot: "w-14" },
};

export default function MascotBadge({ pose = "idle", size = "md", className = "" }: MascotBadgeProps) {
  const colors = POSE_COLORS[pose];
  const sizes = SIZE_MAP[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ring-2 ${colors.bg} ${colors.ring} ${sizes.badge} ${className}`}
    >
      <MeasuringMate pose={pose} className={sizes.mascot} />
    </div>
  );
}
