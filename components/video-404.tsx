"use client";

import { useEffect, useRef } from "react";

export default function Video404() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!video || !canvas || !ctx) return;

    let raf = 0;
    const draw = () => {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          const luma = (d[i] + d[i + 1] + d[i + 2]) / 3;
          d[i + 3] = luma < 4 ? 0 : luma < 12 ? ((luma - 4) / 8) * 255 : 255;
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src="/404-video.mp4"
        autoPlay
        muted
        playsInline
        className="absolute w-px h-px opacity-0 pointer-events-none"
      />
      <canvas ref={canvasRef} width={768} height={768} className="w-40 sm:w-52 h-auto" />
    </>
  );
}
