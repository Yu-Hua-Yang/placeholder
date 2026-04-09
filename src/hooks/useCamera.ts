"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { captureVideoToBase64 } from "@/lib/image";

type FacingMode = "user" | "environment";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [canFlip, setCanFlip] = useState(false);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  // Check if device has multiple cameras
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const cameras = devices.filter((d) => d.kind === "videoinput");
      setCanFlip(cameras.length > 1);
    }).catch(() => {});
  }, []);

  const startWithMode = useCallback(async (mode: FacingMode) => {
    stop();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode, width: { ideal: 1280 } },
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return stream;
  }, [stop]);

  const start = useCallback(async () => {
    return startWithMode(facingMode);
  }, [startWithMode, facingMode]);

  const flip = useCallback(async () => {
    const newMode: FacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await startWithMode(newMode);
  }, [facingMode, startWithMode]);

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

  return { videoRef, start, stop, capture, attachVideo, flip, canFlip, facingMode };
}
