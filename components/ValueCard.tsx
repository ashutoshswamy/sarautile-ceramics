"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, useHoverTween } from "@/lib/gsap";

// Was `className="rise ... transition-all duration-300 hover:-translate-y-1
// hover:shadow-[...]"` - scroll reveal + hover lift, both GSAP-driven here.
export default function ValueCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useHoverTween(ref, { y: -3 });

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            end: "top 60%",
            scrub: true,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className="relative">
      {children}
    </div>
  );
}
