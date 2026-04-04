"use client";

import { useState, useEffect } from "react";
import type { WizardRecommendedProduct } from "@/lib/types";
import ProductResultCard from "./ProductResultCard";
import MeasuringMate from "./MeasuringMate";
import MascotBadge from "./MascotBadge";

interface ProductResultsStepProps {
  products: WizardRecommendedProduct[];
  isLoading: boolean;
}

const LOADING_STEPS: { label: string; pose: "search" | "run" | "think" | "present" }[] = [
  { label: "Scanning partner inventories", pose: "search" },
  { label: "Cross-referencing your body profile", pose: "think" },
  { label: "Ranking by fit & performance", pose: "run" },
  { label: "Finalizing your top picks", pose: "present" },
];

function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const progress = ((activeStep + 1) / LOADING_STEPS.length) * 100;
  // Mascot grows from 80px to 140px as steps progress
  const mascotSizes = [80, 96, 116, 140];
  const mascotSize = mascotSizes[activeStep];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Large animated mascot with color aura */}
        <div className="mb-8 flex justify-center">
          <div className="mascot-aura relative flex items-center justify-center">
            <div
              className="transition-all duration-700 ease-out"
              style={{ width: mascotSize, height: mascotSize }}
            >
              <MeasuringMate pose={LOADING_STEPS[activeStep].pose} className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-black transition-all duration-700 ease-out dark:bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps checklist */}
        <div className="flex flex-col gap-4">
          {LOADING_STEPS.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 transition-opacity duration-500 ${
                  i > activeStep ? "opacity-30" : "opacity-100"
                }`}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {done ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : active ? (
                    <div className="h-2 w-2 rounded-full bg-black dark:bg-white loading-pulse" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    done
                      ? "text-zinc-400 dark:text-zinc-500"
                      : active
                        ? "text-black dark:text-white"
                        : "text-zinc-300 dark:text-zinc-600"
                  }`}
                >
                  {step.label}
                  {active && <span className="loading-ellipsis" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProductResultsStep({ products, isLoading }: ProductResultsStepProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <MascotBadge pose="present" size="md" />
        <div>
          <h2 className="text-xl font-black tracking-tight text-black sm:text-2xl dark:text-white">
            {products.length} matches found
          </h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Ranked by suitability. Sourced from our partner stores.
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product, i) => (
            <ProductResultCard key={product.id} product={product} isTopPick={i === 0} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-zinc-400">
          <p>No matching products found. Try a different movement goal.</p>
        </div>
      )}
    </div>
  );
}
