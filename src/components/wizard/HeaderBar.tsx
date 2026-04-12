"use client";

interface HeaderBarProps {
  onStartOver: () => void;
}

export default function HeaderBar({ onStartOver }: HeaderBarProps) {
  const handleStartOver = () => {
    if (window.confirm("Start over? Your current progress will be lost.")) {
      onStartOver();
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4 sm:px-8">
      <span className="text-2xl font-serif font-light italic text-white">
        AuraFits
      </span>
      <button
        type="button"
        onClick={handleStartOver}
        className="text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:text-white"
      >
        Start over
      </button>
    </div>
  );
}
