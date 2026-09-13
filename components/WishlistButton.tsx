"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";

export default function WishlistButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const active = has(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(slug);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      className={`z-[1] grid place-items-center w-9 h-9 rounded-full border border-rule bg-paper/85 backdrop-blur-sm text-ink-soft cursor-pointer transition-colors hover:text-terracotta hover:border-rule-strong ${className}`}
    >
      <Heart
        size={16}
        strokeWidth={1.8}
        className={active ? "fill-terracotta text-terracotta" : ""}
      />
    </button>
  );
}
