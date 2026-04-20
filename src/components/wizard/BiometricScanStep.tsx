"use client";

import { useState, useEffect, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { resizeImageToBase64 } from "@/lib/image";
import BodySilhouetteSvg from "@/components/ui/BodySilhouetteSvg";
import ProductTeaser, { prefetchTeasers } from "./ProductTeaser";

interface BiometricScanStepProps {
  onCapture: (image: string) => void;
  isLoading: boolean;
}

const ANALYZE_STEPS = [
  "Detecting body landmarks",
  "Mapping proportions",
  "Analyzing posture & alignment",
  "Reading skin tone & coloring",
  "Building color palette",
];

function ScanOverlay() {
  return (
    <>
      {/* Scan line */}
      <div className="scan-line" />

      {/* Grid overlay */}
      <div className="absolute inset-0 scan-grid" />

      {/* Corner brackets - animated */}
      <div className="pointer-events-none absolute inset-4">
        <div className="scan-bracket absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-white/70" />
        <div className="scan-bracket absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-white/70" style={{ animationDelay: "0.5s" }} />
        <div className="scan-bracket absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-white/70" style={{ animationDelay: "1s" }} />
        <div className="scan-bracket absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-white/70" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Telemetry labels */}
      <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-1">
        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">AuraFits Scan</span>
        <span className="text-[8px] font-[monospace] text-white/30">Live</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col items-end gap-1">
        <span className="text-[8px] font-[monospace] text-white/30">1280 × 960</span>
        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">Ready</span>
      </div>

      {/* Body frame guide */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <BodySilhouetteSvg className="h-[70%] w-auto opacity-[0.12]" />
      </div>
    </>
  );
}

export default function BiometricScanStep({ onCapture, isLoading }: BiometricScanStepProps) {
  const { videoRef, start, stop, capture, attachVideo, flip, canFlip } = useCamera();
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCameraFailed = !!error && !cameraActive;

  // Advance analyze steps while loading
  useEffect(() => {
    if (!isLoading) { setAnalyzeStep(0); return; }
    const interval = setInterval(() => {
      setAnalyzeStep((prev) => Math.min(prev + 1, ANALYZE_STEPS.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    prefetchTeasers();
    start()
      .then(() => setCameraActive(true))
      .catch(() => setError("Camera not available. Please allow camera access or upload a photo."));
    return () => stop();
  }, [start, stop]);

  useEffect(() => {
    if (cameraActive) attachVideo();
  }, [cameraActive, attachVideo]);

  const handleCapture = () => {
    setError(null);
    const image = capture();
    if (image) {
      stop();
      onCapture(image);
    } else {
      setError("Failed to capture image. Please try again.");
    }
  };

  const handleFlip = async () => {
    try {
      await flip();
    } catch {
      setError("Could not switch camera.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const base64 = await resizeImageToBase64(file);
      stop();
      onCapture(base64);
    } catch {
      setError("Failed to process image. Please try another file.");
    }
  };

  // Analyzing mode — product ad with loading bar
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        {/* Loading bar — clear, separate from the ad */}
        <div className="shrink-0 border-b border-zinc-900 bg-black px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {ANALYZE_STEPS[analyzeStep]}
            </span>
          </div>
          <div className="mt-2 h-px w-full bg-zinc-800">
            <div
              className="h-full bg-white transition-all duration-[1800ms] ease-out"
              style={{ width: `${((analyzeStep + 1) / ANALYZE_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Product ad — clean, full remaining space */}
        <div className="relative min-h-0 flex-1 sm:p-4">
          <div className="relative mx-auto h-full w-full overflow-hidden bg-zinc-950 sm:max-w-lg">
            <ProductTeaser className="absolute inset-0" />
          </div>
        </div>
      </div>
    );
  }

  // Camera mode
  return (
    <div className="h-full sm:p-4">
      <div className="relative mx-auto h-full w-full overflow-hidden bg-zinc-950 sm:max-w-lg">
        {cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        ) : isCameraFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
              <path d="M1 1l22 22" />
              <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9" />
              <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
            </svg>
            <div>
              <p className="text-sm font-medium text-zinc-300">Camera not available</p>
              <p className="mt-2 text-xs text-zinc-500">Upload a full-body photo instead — works just as well</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              className="mt-2 w-full max-w-xs bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200"
            >
              Upload Photo
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="spinner" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Starting camera
            </span>
          </div>
        )}

        {/* Scan overlay */}
        {cameraActive && <ScanOverlay />}

        {/* Flip button */}
        {canFlip && cameraActive && (
          <button
            type="button"
            onClick={handleFlip}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center bg-black/50 text-white/70 transition-colors hover:bg-black/70 hover:text-white"
            aria-label="Flip camera"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
              <polyline points="16 3 19 6 16 9" />
              <polyline points="8 21 5 18 8 15" />
            </svg>
          </button>
        )}

        {/* Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

        {/* Title — top */}
        <div className="absolute top-0 left-0 right-0 p-5">
          <h2 className="text-lg font-black uppercase tracking-tight text-white sm:text-xl">Body Scan</h2>
          <p className="mt-1 text-[10px] text-white/50">Align your body with the guide for best results</p>
          <p className="mt-0.5 text-[9px] text-white/30">Selfie works too — just less accurate</p>
        </div>

        {/* Controls — bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pt-5 p-safe-bottom">
          {isCameraFailed ? (
            <div className="flex flex-col items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                aria-label="Upload photo"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!cameraActive}
                className="w-full bg-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-zinc-200 disabled:opacity-30"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  fileInputRef.current?.click();
                }}
                className="w-full border border-white/20 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white hover:text-white"
              >
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                aria-label="Upload photo"
              />
              {error && (
                <div className="mt-3 text-center text-[10px] text-red-400">{error}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
