"use client";

import { useEffect, useRef } from "react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";

const INTERVAL_MS = 3500;

// One photo: shown as-is. Several: a swipeable strip that auto-advances
// smoothly (and loops), pausing while hovered or touched.
export default function ProductGallery({ label, srcs }: { label: string; srcs: (string | null)[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const count = srcs.length;

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || paused.current) return;
      const next = Math.round(el.scrollLeft / el.clientWidth) + 1;
      el.scrollTo({ left: next >= count ? 0 : next * el.clientWidth, behavior: "smooth" });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [count]);

  if (count < 2) {
    return (
      <PlaceholderPhoto
        label={label}
        src={srcs[0] ?? null}
        rounded="rounded-[28px]"
        className="aspect-square p-4"
      />
    );
  }

  return (
    <div
      ref={trackRef}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => setTimeout(() => (paused.current = false), 4000)}
      className="flex overflow-x-auto snap-x snap-mandatory rounded-[28px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {srcs.map((src, i) => (
        <PlaceholderPhoto
          key={i}
          label={label}
          src={src}
          rounded="rounded-none"
          className="aspect-square p-4 w-full flex-none snap-start"
        />
      ))}
    </div>
  );
}
