"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function RootLoading() {
  const spinnerRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!spinnerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(spinnerRef.current, {
        rotate: 360,
        repeat: -1,
        duration: 1,
        ease: "none",
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center py-32"
    >
      <span
        ref={spinnerRef}
        aria-hidden
        className="h-8 w-8 rounded-full border-2 border-rule border-t-terracotta"
      />
    </div>
  );
}
