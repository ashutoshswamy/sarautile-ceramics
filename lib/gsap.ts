"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

// Tailwind's `hover:` transition utilities, replaced by this hook per element
// so hover motion is GSAP-driven everywhere instead of CSS transitions.
export function useHoverTween<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  vars: gsap.TweenVars,
  fromVars?: gsap.TweenVars
) {
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const tween = gsap.to(el, { ...vars, paused: true, duration: vars.duration ?? 0.25, ease: vars.ease ?? "power2.out" });
    const enter = () => tween.play();
    const leave = () => tween.reverse();
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    if (fromVars) gsap.set(el, fromVars);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, [ref]);
}
