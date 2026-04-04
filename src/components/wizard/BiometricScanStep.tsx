"use client";

import { useState, useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";
import MeasuringMate from "./MeasuringMate";
import MascotBadge from "./MascotBadge";

interface BiometricScanStepProps {
  onCapture: (image: string) => void;
  isLoading: boolean;
}

export default function BiometricScanStep({ onCapture, isLoading }: BiometricScanStepProps) {
  const { videoRef, start, stop, capture, attachVideo } = useCamera();
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    start()
      .then(() => setCameraActive(true))
      .catch(() => setError("Camera not available. Please allow camera access."));
    return () => stop();
  }, [start, stop]);

  useEffect(() => {
    if (cameraActive) attachVideo();
  }, [cameraActive, attachVideo]);

  const handleCapture = () => {
    const image = capture();
    if (image) {
      stop();
      onCapture(image);
    } else {
      setError("Failed to capture image. Please try again.");
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <MascotBadge pose="search" size="md" />
        <div>
          <h2 className="text-xl font-black tracking-tight text-black sm:text-2xl dark:text-white">Body Scan</h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Stand facing the camera. We&apos;ll analyze your body type, posture, and alignment.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-zinc-100 sm:aspect-square sm:max-w-md dark:bg-zinc-900">
          {cameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-700">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
          {/* Corner markers */}
          <div className="pointer-events-none absolute inset-3">
            <div className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-black dark:border-white" />
            <div className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-black dark:border-white" />
            <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-black dark:border-white" />
            <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-black dark:border-white" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isLoading && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!cameraActive}
              className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Capture
            </button>
          )}
          {isLoading && (
            <div className="flex items-center gap-3 text-zinc-400">
              <MascotBadge pose="run" size="md" />
              <span className="text-sm">Analyzing...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
