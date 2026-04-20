"use client";

import { useState } from "react";
import type { OutfitFit } from "@/lib/types";
import OutfitItemCard from "./OutfitItemCard";
import ShareButton from "./ShareCard";

interface TwoFitsViewProps {
  fits: OutfitFit[];
  onGenerateFitImage: (fitIndex: number) => Promise<void>;
}

export default function TwoFitsView({ fits, onGenerateFitImage }: TwoFitsViewProps) {
  const [activeFit, setActiveFit] = useState(0);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  if (fits.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-600">
        <p>No outfits generated. Try a different movement goal.</p>
      </div>
    );
  }

  const fit = fits[activeFit];

  const handleGenerateImage = async () => {
    if (fit.generatedImageBase64 || generatingIndex === activeFit) return;
    setGeneratingIndex(activeFit);
    try {
      await onGenerateFitImage(activeFit);
    } finally {
      setGeneratingIndex(null);
    }
  };

  const isGenerating = generatingIndex === activeFit && !fit.generatedImageBase64;

  return (
    <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          2 Fits
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Two curated outfits styled for you. Toggle to compare.
        </p>
      </div>

      {/* Toggle */}
      <div className="mb-6 flex gap-1 sm:mb-8" role="tablist" aria-label="Outfit fits">
        {fits.map((f, i) => (
          <button
            key={f.name}
            type="button"
            role="tab"
            aria-selected={activeFit === i}
            onClick={() => setActiveFit(i)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
              activeFit === i
                ? "bg-white text-black"
                : "bg-zinc-950 text-zinc-500 hover:text-white"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Content: image left, items right */}
      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-12">
        {/* Generated Image */}
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-zinc-950 lg:w-2/5">
          {fit.generatedImageBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${fit.generatedImageBase64}`}
              alt={`${fit.name} outfit visualization`}
              className="h-full w-full object-contain bg-zinc-950"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              {isGenerating ? (
                <>
                  <div className="spinner" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Generating preview
                  </span>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    className="bg-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200"
                  >
                    Generate Preview
                  </button>
                  <span className="text-[9px] text-zinc-700">See yourself in this outfit</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex flex-1 flex-col">
          <div className="mb-4">
            <p className="text-sm text-zinc-400">{fit.vibe}</p>
            {/* Fit color palette from items */}
            {fit.colorPalette && fit.colorPalette.length > 0 && (
              <p className="mt-2 text-[10px] text-zinc-600">
                {fit.colorPalette.join(" · ")}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            {fit.items.map((item) => (
              <OutfitItemCard key={item.id} product={item} />
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Total
            </span>
            <span className="text-lg font-black text-white">
              ${fit.items.reduce((sum, item) => sum + item.price, 0).toFixed(0)}
            </span>
          </div>

          {/* Share */}
          <div className="mt-6 flex justify-center">
            <ShareButton mode="two-fits" fit={fit} />
          </div>
        </div>
      </div>

    </div>
  );
}
