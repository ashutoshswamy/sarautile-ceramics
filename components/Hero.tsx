"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useHoverTween } from "@/lib/gsap";
import HeroPotAnimation from "@/components/HeroPotAnimation";

// ponytail: module-scoped, not sessionStorage - resets on a hard refresh (wanted)
// but survives client-side nav away from and back to "/" (also wanted).
let hasPlayedThisLoad = false;

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [videoDone, setVideoDone] = useState(hasPlayedThisLoad);

  useHoverTween(ctaRef, { backgroundColor: "var(--terracotta-hover)" });

  useEffect(() => {
    // ponytail: React doesn't reliably set the `muted` property from the
    // attribute on mount, so mobile browsers block autoplay and show a
    // play button. Set it imperatively before calling play().
    const video = videoRef.current;
    if (!video || videoDone) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [videoDone]);

  useEffect(() => {
    if (videoDone) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [videoDone]);

  const revealText = () => {
    if (!textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { autoAlpha: 0, x: -24 },
      { autoAlpha: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );
  };

  const handleVideoEnd = () => {
    hasPlayedThisLoad = true;
    if (!videoWrapRef.current) return setVideoDone(true);
    gsap.to(videoWrapRef.current, {
      xPercent: 100,
      scale: 0.4,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => setVideoDone(true),
    });
  };

  return (
    <section className="relative w-full min-h-[480px] max-h-[900px] overflow-hidden bg-sand">
      {!videoDone && (
        <div ref={videoWrapRef} className="fixed inset-0 z-[100] bg-ink origin-right">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/hero/hero-video.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoEnd}
          />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div ref={textRef} className="invisible order-2 md:order-1">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ink">
            Shaped by hand,
            <br />
            fired with care.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-md">
            Every piece starts as raw clay on the wheel and ends up on your
            table — small-batch ceramics made the slow way.
          </p>
          <Link
            ref={ctaRef}
            href="/products"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper"
          >
            Shop now
          </Link>
        </div>

        <div className="order-1 md:order-2">
          <HeroPotAnimation start={videoDone} onSettled={revealText} />
        </div>
      </div>
    </section>
  );
}
