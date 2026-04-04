"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { resizeImageToBase64, captureVideoToBase64 } from "@/lib/image";

interface PhotoUploadProps {
  onSubmit: (image: string, prompt: string) => void;
  disabled?: boolean;
}

type Mode = "idle" | "camera" | "preview";

export default function PhotoUpload({ onSubmit, disabled }: PhotoUploadProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragCounterRef = useRef(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopCamera();
    };
  }, [previewUrl, stopCamera]);

  useEffect(() => {
    if (mode === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      setMode("camera");
    } catch {
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const raw = captureVideoToBase64(videoRef.current);
      setPreviewUrl(`data:image/jpeg;base64,${raw}`);
      setBase64(raw);
      setMode("preview");
    } catch {
      // ignore
    }
    stopCamera();
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Image is too large (max 10MB). Please choose a smaller photo.");
        return;
      }

      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setBase64(null);
      setIsResizing(true);
      setMode("preview");

      try {
        const result = await resizeImageToBase64(file);
        setBase64(result);
      } catch {
        setError("Failed to process image. Please try another photo.");
        setPreviewUrl(null);
        setMode("idle");
      } finally {
        setIsResizing(false);
      }
    },
    [previewUrl, stopCamera],
  );

  const clearImage = () => {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBase64(null);
    setMode("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (base64 && prompt.trim()) {
      onSubmit(base64, prompt.trim());
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const canSubmit = !!base64 && !!prompt.trim() && !isResizing && !disabled;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden border-2 transition-colors ${
          mode === "camera"
            ? "border-transparent bg-black"
            : isDragging
              ? "border-dashed border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
              : mode === "preview"
                ? "border-transparent"
                : "cursor-pointer border-dashed border-zinc-300 hover:border-black dark:border-zinc-700 dark:hover:border-white"
        }`}
        role={mode === "idle" ? "button" : undefined}
        tabIndex={mode === "idle" ? 0 : undefined}
        aria-label={mode === "idle" ? "Upload a photo" : undefined}
        onClick={() => { if (mode === "idle") fileInputRef.current?.click(); }}
        onKeyDown={(e) => {
          if (mode === "idle" && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {mode === "camera" && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Take photo"
              className="absolute bottom-3 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-white/30 transition-colors hover:bg-white/50"
              onClick={capturePhoto}
            >
              <div className="h-10 w-10 rounded-full bg-white" />
            </button>
            <button
              type="button"
              aria-label="Cancel camera"
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              onClick={clearImage}
            >
              <XIcon />
            </button>
          </>
        )}

        {mode === "preview" && previewUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Upload preview" className="h-full w-full object-cover" />
            {isResizing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-sm font-medium text-white">Processing...</span>
              </div>
            )}
            <button
              type="button"
              aria-label="Remove photo"
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              onClick={(e) => { e.stopPropagation(); clearImage(); }}
            >
              <XIcon />
            </button>
          </>
        )}

        {mode === "idle" && (
          <div className="flex flex-col items-center gap-3 text-zinc-400 dark:text-zinc-600">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm">Drag & drop or click to browse</span>
            <button
              type="button"
              className="flex items-center gap-1.5 border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-black hover:text-black dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-white dark:hover:text-white"
              onClick={(e) => { e.stopPropagation(); startCamera(); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Use camera
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="animate-fade-in border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What are you looking for today?"
        aria-label="What are you looking for today?"
        className="w-full border-b-2 border-zinc-200 bg-transparent px-1 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-black dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:focus:border-white"
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-12 items-center justify-center bg-black text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Start
      </button>
    </form>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
