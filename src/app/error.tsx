"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="mt-2 text-sm text-zinc-400">An unexpected error occurred.</p>
      <button
        onClick={reset}
        className="mt-6 border border-white px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-white hover:text-black"
      >
        Try again
      </button>
    </div>
  );
}
