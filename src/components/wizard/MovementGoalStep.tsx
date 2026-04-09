"use client";

import { useState, useEffect, useRef } from "react";

interface MovementGoalStepProps {
  onSubmit: (goal: string) => void;
  onPrefetch: (goal: string) => void;
  isLoading: boolean;
}

const QUICK_PILLS = [
  "Rick Owens head-to-toe dark avant-garde look",
  "Full Nike fit — sneakers, joggers, layers",
  "Complete gym outfit for heavy lifting",
  "Casual streetwear drip for going out",
];

export default function MovementGoalStep({ onSubmit, onPrefetch, isLoading }: MovementGoalStepProps) {
  const [input, setInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefetchedPills = useRef(false);

  // Prefetch questions for quick pills on mount
  useEffect(() => {
    if (prefetchedPills.current) return;
    prefetchedPills.current = true;
    QUICK_PILLS.forEach((pill) => onPrefetch(pill));
  }, [onPrefetch]);

  // Debounce prefetch as user types (800ms after they stop)
  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length < 5) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onPrefetch(trimmed);
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, onPrefetch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (text && !isLoading) onSubmit(text);
  };

  const handlePill = (pill: string) => {
    if (!isLoading) onSubmit(pill);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-8">
      <div className="w-full max-w-xl">
        <h1 className="mb-3 text-center text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
          What are you looking for?
        </h1>
        <p className="mx-auto mb-12 max-w-md text-center text-sm text-zinc-500">
          The more precise you are, the better your recommendations will be.
        </p>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Running shoes, gym outfit, streetwear fit"
              disabled={isLoading}
              className="w-full border-b border-zinc-800 bg-transparent py-4 pl-1 pr-16 text-lg font-medium text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-white disabled:opacity-50"
            />
            {input.trim() && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-10 w-10 items-center justify-center bg-white text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
                  aria-label="Submit"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handlePill(pill)}
              disabled={isLoading}
              className="border border-zinc-800 px-4 py-2 text-sm text-zinc-500 transition-colors hover:border-white hover:text-white disabled:opacity-30"
            >
              {pill}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-zinc-500">
            <div className="spinner" />
            <span className="text-sm uppercase tracking-wider">Generating questions</span>
          </div>
        )}
      </div>
    </div>
  );
}
