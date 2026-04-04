"use client";

import MascotBadge from "./MascotBadge";

interface HeaderBarProps {
  onStartOver: () => void;
}

export default function HeaderBar({ onStartOver }: HeaderBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 sm:px-6 sm:py-3 dark:border-zinc-800">
      <span className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-black dark:text-white">
        <MascotBadge pose="wave" size="sm" />
        AuraFit
      </span>
      <button
        type="button"
        onClick={onStartOver}
        className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:border-black hover:text-black dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-white dark:hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Start over
      </button>
    </div>
  );
}
