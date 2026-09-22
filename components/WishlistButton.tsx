"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";
import { gsap, useGSAP, useHoverTween } from "@/lib/gsap";

export default function WishlistButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const active = has(slug);
  const btnRef = useRef<HTMLButtonElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const mounted = useRef(false);

  useHoverTween(btnRef, { color: "var(--terracotta)", borderColor: "var(--rule-strong)" });

  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (!heartRef.current) return;
      gsap.fromTo(
        heartRef.current,
        { scale: 1.35 },
        { scale: 1, duration: 0.35, ease: "back.out(3)" }
      );
    },
    { dependencies: [active] }
  );

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(slug);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      className={`z-[1] grid place-items-center w-9 h-9 rounded-full border border-rule bg-paper/85 backdrop-blur-sm text-ink-soft cursor-pointer ${className}`}
    >
      <Heart
        ref={heartRef}
        size={16}
        strokeWidth={1.8}
        className={active ? "fill-terracotta text-terracotta" : ""}
      />
    </button>
  );
}
