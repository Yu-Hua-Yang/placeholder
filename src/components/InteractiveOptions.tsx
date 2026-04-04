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
          className={`flex min-h-[44px] items-center gap-2 border px-3 py-2.5 text-left text-sm transition-colors ${
            option.selected
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : disabled
                ? "cursor-not-allowed border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
                : "border-zinc-200 text-zinc-700 hover:border-black hover:text-black dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
          }`}
        >
          {option.icon && <span className="text-base">{option.icon}</span>}
          <span className="leading-tight">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
