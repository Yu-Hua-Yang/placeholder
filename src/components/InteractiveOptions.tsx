"use client";

import type { InteractiveOption } from "@/lib/types";

interface InteractiveOptionsProps {
  options: InteractiveOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function InteractiveOptions({
  options,
  onSelect,
  disabled,
}: InteractiveOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {options.map((option, index) => (
        <button
          key={`${option.value}-${index}`}
          type="button"
          disabled={disabled || option.selected}
          onClick={() => onSelect(option.value)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
            option.selected
              ? "border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
              : disabled
                ? "cursor-not-allowed border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
                : "border-zinc-200 bg-white text-zinc-700 shadow-sm hover:scale-[1.03] hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          }`}
        >
          {option.icon && <span className="text-base">{option.icon}</span>}
          <span className="leading-tight">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
