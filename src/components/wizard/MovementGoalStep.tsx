"use client";

import { useState } from "react";
import MeasuringMate from "./MeasuringMate";
import MascotBadge from "./MascotBadge";

interface MovementGoalStepProps {
  onSubmit: (goal: string) => void;
  isLoading: boolean;
}

const QUICK_PILLS = [
  "Running a half marathon",
  "Everyday gym workouts",
  "Recovering from knee surgery",
  "Standing all day at work",
];

export default function MovementGoalStep({ onSubmit, isLoading }: MovementGoalStepProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (text && !isLoading) onSubmit(text);
  };

  const handlePill = (pill: string) => {
    if (!isLoading) onSubmit(pill);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex justify-center sm:mb-6">
          <MascotBadge pose="idle" size="lg" />
        </div>

        <h1 className="mb-2 text-center text-3xl font-black tracking-tight text-black sm:text-5xl dark:text-white">
          What are you looking for?
        </h1>
        <p className="mx-auto mb-10 max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
          The more precise you are, the better your recommendations will be.
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Marathon Training"
              disabled={isLoading}
              className="w-full border-b-2 border-zinc-200 bg-transparent py-4 pl-1 pr-24 text-lg font-medium outline-none transition-colors placeholder:text-zinc-300 focus:border-black disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-600 dark:focus:border-white"
            />
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-zinc-300 transition-colors hover:text-black dark:text-zinc-600 dark:hover:text-white"
                aria-label="Voice input"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              {input.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  aria-label="Submit"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handlePill(pill)}
              disabled={isLoading}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-black hover:text-black disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-white dark:hover:text-white"
            >
              {pill}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-10 flex items-center justify-center gap-3 text-zinc-400">
            <MascotBadge pose="run" size="md" />
            <span className="text-sm">Generating questions...</span>
          </div>
        )}
      </div>
    </div>
  );
}
