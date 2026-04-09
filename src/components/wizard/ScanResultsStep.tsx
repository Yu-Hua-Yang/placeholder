"use client";

import { useEffect } from "react";
import type { BiometricResult } from "@/lib/types";
import { prefetchTeasers } from "./ProductTeaser";

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
  useEffect(() => { prefetchTeasers(); }, []);
  const palette = results.personalPalette || [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-6 sm:px-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Scan Complete</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Your physique has been analyzed. These results will shape your recommendations.
        </p>
      </div>

      {/* Main content — image left, metrics right */}
      <div className="flex flex-1 flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Image */}
        <div className="shrink-0 lg:w-1/3">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
            {biometricImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/jpeg;base64,${biometricImage}`}
                alt="Body scan"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-700">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Physical + Aesthetic in two columns on desktop */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Physical */}
            <div>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">Physical</div>
              <div className="flex flex-col gap-3">
                {PHYSICAL_METRICS.map(({ key, label }) => (
                  <div key={key} className="border-l border-white/30 py-1 pl-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{label}</div>
                    <div className="text-sm font-bold text-white">{results[key] as string}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aesthetic */}
            <div>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">Aesthetic</div>
              <div className="flex flex-col gap-3">
                {AESTHETIC_METRICS.map(({ key, label }) => (
                  <div key={key} className="border-l border-zinc-800 py-1 pl-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{label}</div>
                    <div className="text-sm font-bold text-white">{results[key] as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outfit Color Combos */}
          {palette.length > 0 && (() => {
            const combos: Record<string, typeof palette> = {};
            for (const c of palette) {
              if (!combos[c.usage]) combos[c.usage] = [];
              combos[c.usage].push(c);
            }
            const comboLabels = [
              { key: "combo-1", label: "Everyday" },
              { key: "combo-2", label: "Bold" },
              { key: "combo-3", label: "Tonal" },
            ];
            return (
              <div>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                  Outfit Color Combos
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                  {comboLabels.map(({ key, label }) => {
                    const colors = combos[key] || [];
                    if (colors.length === 0) return null;
                    return (
                      <div key={key} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                        <div className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-white sm:w-auto">
                          {label}
                        </div>
                        <div className="flex gap-1.5">
                          {colors.map((color) => (
                            <div key={color.hex} className="flex flex-col items-center gap-1">
                              <div
                                className="h-10 w-10 border border-zinc-800 sm:h-14 sm:w-14"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-[7px] font-bold text-zinc-500">{color.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-zinc-800">
            <div className="h-full w-full bg-white transition-all duration-1000" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Complete</span>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="bg-white px-10 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200 disabled:opacity-30"
        >
          {isLoading ? "Loading..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
