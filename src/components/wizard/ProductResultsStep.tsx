"use client";

import { useState, useEffect, useRef } from "react";
import type { RecommendationResult, ColorPaletteEntry } from "@/lib/types";
import TenPicksView from "./TenPicksView";
import TwoFitsView from "./TwoFitsView";

interface ProductResultsStepProps {
  result: RecommendationResult | null;
  isLoading: boolean;
  personalPalette: ColorPaletteEntry[];
  onGenerateFitImage: (fitIndex: number) => Promise<void>;
}

const LOADING_STEPS = [
  "Scanning partner inventories",
  "Cross-referencing your body profile",
  "Ranking by fit & performance",
  "Finalizing your selections",
];

const VIDEOS = [
  "/videos/fashion-1.mp4",
  "/videos/fashion-2.mp4",
  "/videos/fashion-3.mp4",
];

const VIDEO_CAPTIONS = [
  { accent: "CURATED", headline: "Thousands of products, one recommendation" },
  { accent: "STYLED FOR YOU", headline: "Every pick matched to your body & palette" },
  { accent: "40+ BRANDS", headline: "From streetwear to luxury, all in one place" },
];

function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleVideoEnd = () => {
    setActiveVideo((prev) => (prev + 1) % VIDEOS.length);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeVideo]);

  const progress = ((activeStep + 1) / LOADING_STEPS.length) * 100;
  const caption = VIDEO_CAPTIONS[activeVideo];

  return (
    <div className="h-full sm:p-4">
      {/* Video — full height on mobile, centered card on desktop */}
      <div className="relative mx-auto flex h-full w-full overflow-hidden bg-black sm:max-w-lg">
        <video
          ref={videoRef}
          src={VIDEOS[activeVideo]}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="h-full w-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Story progress bars at top */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3">
          {VIDEOS.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 overflow-hidden bg-white/20">
              <div
                className={`h-full bg-white transition-all ${
                  i < activeVideo
                    ? "w-full"
                    : i === activeVideo
                      ? "w-full duration-[8000ms] ease-linear"
                      : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="mb-2 inline-block text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">
            {caption.accent}
          </span>
          <h3 className="mb-4 text-sm font-black uppercase leading-tight tracking-tight text-white sm:text-base">
            {caption.headline}
          </h3>

          {/* Inline loading progress */}
          <div className="flex flex-col gap-2.5">
            {LOADING_STEPS.map((label, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              if (i > activeStep + 1) return null; // only show current + next
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 transition-opacity duration-500 ${
                    i > activeStep ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : active ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-white loading-pulse" />
                    ) : (
                      <div className="h-1 w-1 rounded-full bg-white/30" />
                    )}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider ${done ? "text-white/40" : active ? "font-bold text-white" : "text-white/30"}`}>
                    {label}
                    {active && <span className="loading-ellipsis" />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductResultsStep({ result, isLoading, personalPalette, onGenerateFitImage }: ProductResultsStepProps) {
  if (isLoading || !result) {
    return <LoadingState />;
  }

  if (result.mode === "ten-picks") {
    return <TenPicksView category={result.category} products={result.products} personalPalette={personalPalette} />;
  }

  return <TwoFitsView fits={result.fits} onGenerateFitImage={onGenerateFitImage} />;
}
