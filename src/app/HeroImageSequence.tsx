"use client";

import { useEffect, useRef, useState } from "react";

interface HeroImageSequenceProps {
  totalFrames?: number;
  fps?: number;
  fastUntilFrame?: number;
  fastFps?: number;
  folder?: string;
  videoSrc?: string;
  className?: string;
  onReady?: () => void;
}

export default function HeroImageSequence({
  videoSrc = "/scene_first.mp4",
  className = "w-full h-full object-cover object-center",
  onReady,
}: HeroImageSequenceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const firedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const triggerReady = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setReady(true);
    onReadyRef.current?.();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Если видео уже в кэше браузера
    if (video.readyState >= 3) {
      triggerReady();
      video.play().catch(() => {});
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        autoPlay
        preload="auto"
        onCanPlay={() => {
          triggerReady();
          videoRef.current?.play().catch(() => {});
        }}
        onLoadedData={() => {
          triggerReady();
        }}
        className={`${className} bg-black select-none pointer-events-none`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      />
    </div>
  );
}
