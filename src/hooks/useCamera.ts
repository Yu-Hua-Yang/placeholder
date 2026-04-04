"use client";

import { useRef, useCallback, useEffect } from "react";
import { captureVideoToBase64 } from "@/lib/image";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const start = useCallback(async () => {
    stop();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 } },
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return stream;
  }, [stop]);

  const attachVideo = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, []);

  const capture = useCallback((): string | null => {
    if (!videoRef.current) return null;
    try {
      return captureVideoToBase64(videoRef.current);
    } catch {
      return null;
    }
  }, []);

  return { videoRef, start, stop, capture, attachVideo };
}
