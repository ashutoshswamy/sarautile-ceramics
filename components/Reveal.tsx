"use client";

import { useRef, ElementType, ComponentPropsWithoutRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Replaces the old CSS `.rise` scroll-timeline reveal with a GSAP
// ScrollTrigger fromTo, same easing/offsets as the original @keyframes.
export default function Reveal<T extends ElementType = "div">({
  as,
  children,
  ...rest
}: { as?: T } & ComponentPropsWithoutRef<T>) {
  const Tag = (as || "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

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
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
