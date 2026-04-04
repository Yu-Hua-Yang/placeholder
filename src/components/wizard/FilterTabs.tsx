"use client";

import type { ProductFilterMode } from "@/lib/types";

interface FilterTabsProps {
  mode: ProductFilterMode;
  onChangeMode: (mode: ProductFilterMode) => void;
}

export default function FilterTabs({ mode, onChangeMode }: FilterTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChangeMode("technical")}
        className={`flex items-center gap-2 border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
          mode === "technical"
            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
            : "border-zinc-200 text-zinc-400 hover:border-black hover:text-black dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-white dark:hover:text-white"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Technical
      </button>
      <button
        type="button"
        onClick={() => onChangeMode("aesthetic")}
        className={`flex items-center gap-2 border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
          mode === "aesthetic"
            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
            : "border-zinc-200 text-zinc-400 hover:border-black hover:text-black dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-white dark:hover:text-white"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Aesthetic
      </button>
    </div>
  );
}
