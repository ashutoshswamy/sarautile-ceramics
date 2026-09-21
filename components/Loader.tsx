"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// public/loading-video-final.mp4 is 5s - the fallback timer is a safety net
// in case autoplay is blocked or the video fails to load, not the primary trigger.
const VIDEO_DURATION_MS = 5000;
const FALLBACK_MS = VIDEO_DURATION_MS + 1000;

// ponytail: the video's white background can't carry an alpha channel as an
// mp4, and WebM/VP9 alpha isn't supported in Safari - so instead of shipping
// a second video format, key the white out live, per frame, onto a canvas.
const WHITE_FLOOR = 225; // channel value below this stays fully opaque
const WHITE_CEIL = 250; // at/above this is fully transparent

function keyOutWhite(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;
  for (let i = 0; i < data.length; i += 4) {
    const whiteness = Math.min(data[i], data[i + 1], data[i + 2]);
    if (whiteness >= WHITE_CEIL) {
      data[i + 3] = 0;
    } else if (whiteness > WHITE_FLOOR) {
      data[i + 3] = Math.round(
        255 * (1 - (whiteness - WHITE_FLOOR) / (WHITE_CEIL - WHITE_FLOOR))
      );
    }
  }
  ctx.putImageData(frame, 0, 0);
}

export default function Loader() {
  const pathname = usePathname();
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const t = setTimeout(() => setHide(true), FALLBACK_MS);
    return () => clearTimeout(t);
  }, [isHome]);

  useEffect(() => {
    if (!hide) return;
    const t = setTimeout(() => setGone(true), 600); // match CSS fade-out
    return () => clearTimeout(t);
  }, [hide]);

  useEffect(() => {
    if (!isHome || gone) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!video || !canvas || !ctx) return;

    let raf = 0;
    const draw = () => {
      if (video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        keyOutWhite(ctx, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [isHome, gone]);

  if (!isHome || gone) return null;

  return (
    <div
      className="loader"
      data-hide={hide}
      role="status"
      aria-label="Loading"
    >
      <video
        ref={videoRef}
        src="/loading-video-final.mp4"
        className="loader-video-source"
        autoPlay
        muted
        playsInline
        onEnded={() => setHide(true)}
      />
      <canvas ref={canvasRef} className="loader-video" aria-hidden="true" />
      <span className="loader-word">firing</span>
      <div className="loader-bar" aria-hidden="true">
        <div className="loader-bar-fill" style={{ animationDuration: `${VIDEO_DURATION_MS}ms` }} />
      </div>
    </div>
  );
}
