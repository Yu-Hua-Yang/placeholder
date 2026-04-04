"use client";

import type { BiometricResult } from "@/lib/types";
import MascotBadge from "./MascotBadge";

interface ScanResultsStepProps {
  biometricImage: string | null;
  results: BiometricResult;
  onContinue: () => void;
  isLoading: boolean;
}

const PHYSICAL_METRICS: { key: keyof BiometricResult; label: string }[] = [
  { key: "bodyType", label: "BODY TYPE" },
  { key: "buildEstimate", label: "BUILD" },
  { key: "posture", label: "POSTURE" },
];

const AESTHETIC_METRICS: { key: keyof BiometricResult; label: string }[] = [
  { key: "skinTone", label: "SKIN TONE" },
  { key: "hairColor", label: "HAIR" },
  { key: "colorSeason", label: "COLOR SEASON" },
  { key: "styleVibe", label: "STYLE VIBE" },
];

export default function ScanResultsStep({ biometricImage, results, onContinue, isLoading }: ScanResultsStepProps) {
  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <MascotBadge pose="present" size="md" />
        <div>
          <h2 className="text-xl font-black tracking-tight text-black sm:text-2xl dark:text-white">Scan Complete</h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Your physique has been analyzed. These results will shape your recommendations.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative aspect-[3/4] w-full max-w-xs shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:aspect-square sm:max-w-md dark:bg-zinc-900">
          {biometricImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${biometricImage}`}
              alt="Body scan"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-700">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-col sm:gap-4">
          <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Physical</div>
          {PHYSICAL_METRICS.map(({ key, label }) => (
            <div key={key} className="border-l-2 border-black py-1 pl-3 sm:pl-4 dark:border-white">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {label}
              </div>
              <div className="text-sm font-bold text-black sm:text-base dark:text-white">
                {results[key]}
              </div>
            </div>
          ))}
          <div className="col-span-2 mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 sm:mt-2">Aesthetic</div>
          {AESTHETIC_METRICS.map(({ key, label }) => (
            <div key={key} className="border-l-2 border-zinc-300 py-1 pl-3 sm:pl-4 dark:border-zinc-600">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {label}
              </div>
              <div className="text-sm font-bold text-black sm:text-base dark:text-white">
                {results[key]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between sm:mt-6">
        <div className="flex items-center gap-3">
          <div className="h-1 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-full rounded-full bg-black transition-all duration-1000 dark:bg-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Complete</span>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="rounded-full bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isLoading ? "Loading..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
