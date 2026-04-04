"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { resizeImageToBase64 } from "@/lib/image";

interface PhotoUploadProps {
  onSubmit: (image: string, prompt: string) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ onSubmit, disabled }: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setBase64(null);
    setIsResizing(true);

    try {
      const result = await resizeImageToBase64(file);
      setBase64(result);
    } catch {
      setPreviewUrl(null);
    } finally {
      setIsResizing(false);
    }
  }, [previewUrl]);

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBase64(null);
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
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a photo"
        className={`relative flex aspect-video cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : previewUrl
              ? "border-transparent"
              : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
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

        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-full w-full rounded-xl object-cover"
            />
            {isResizing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                <span className="text-sm font-medium text-white">
                  Processing...
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label="Remove photo"
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M11 3L3 11M3 3l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm">
              Drag & drop a photo or click to browse
            </span>
          </div>
        )}
      </div>

      {/* Text input */}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What are you looking for today?"
        aria-label="What are you looking for today?"
        className="w-full rounded-lg border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
      />

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#ccc]"
      >
        Start
      </button>
    </form>
  );
}
