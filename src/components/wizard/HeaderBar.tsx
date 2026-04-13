"use client";

export default function HeaderBar({ onStartOver }: { onStartOver?: () => void }) {
  const handleStartOver = () => {
    if (window.confirm("Start over? Your current progress will be lost.")) {
      onStartOver?.();
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3 sm:px-8 sm:py-4">
      <button
        type="button"
        onClick={handleStartOver}
        className="text-xl font-serif font-light italic text-white sm:text-2xl hover:text-zinc-300 transition-colors"
      >
        AuraFits
      </button>
      <button
        type="button"
        onClick={handleStartOver}
        className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-white sm:text-xs sm:tracking-wider"
      >
        Start over
      </button>
    </div>
  );
}
