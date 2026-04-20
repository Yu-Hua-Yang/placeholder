import { memo } from "react";

interface OptionButtonProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default memo(function OptionButton({ label, value, onSelect, disabled }: OptionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { if (!disabled) onSelect(value); }}
      className={`flex min-h-[48px] w-full items-center justify-between border-b px-1 py-3 text-left text-base font-semibold transition-all sm:min-h-[56px] sm:py-4 sm:text-lg ${
        disabled
          ? "cursor-not-allowed border-zinc-900 text-zinc-700"
          : "border-zinc-800 text-zinc-400 hover:border-white hover:text-white active:border-white active:text-white"
      }`}
    >
      <span>{label}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-20">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
});
