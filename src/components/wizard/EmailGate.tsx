"use client";

import { useState, useEffect } from "react";

interface EmailGateProps {
  onSubmit: (email: string) => void;
}

export default function EmailGate({ onSubmit }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Skip gate if user already entered email this session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("aurafits_email");
      if (stored) onSubmit(stored);
    } catch {}
  }, [onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-md text-center">
        <h2 className="mb-2 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
          Almost there
        </h2>
        <p className="mb-12 text-sm text-zinc-500">
          Enter your email to get your personalized recommendations sent to you.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="Enter your email"
            autoFocus
            className="mb-4 w-full border-b border-zinc-800 bg-transparent py-4 text-center text-lg font-medium text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-accent"
          />
          {error && (
            <p className="mb-4 text-center text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-accent py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-sky-200"
          >
            Continue
          </button>
        </form>

        <button
          type="button"
          onClick={() => onSubmit("")}
          className="mt-6 text-[11px] text-zinc-600 underline underline-offset-2 transition-colors hover:text-zinc-400"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
