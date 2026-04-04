"use client";

import { useState } from "react";

interface OptionButtonProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function OptionButton({ label, value, onSelect, disabled }: OptionButtonProps) {
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    if (disabled || selected) return;
    setSelected(true);
    setTimeout(() => onSelect(value), 250);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`flex min-h-[48px] w-full items-center justify-between border-b px-1 py-3 text-left text-base font-semibold transition-all sm:min-h-[56px] sm:py-4 sm:text-lg ${
        selected
          ? "border-black text-black dark:border-white dark:text-white"
          : disabled
            ? "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
            : "border-zinc-200 text-zinc-700 hover:border-black hover:text-black dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
      }`}
    >
      <span>{label}</span>
      {selected ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-20">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      )}
    </button>
  );
}
