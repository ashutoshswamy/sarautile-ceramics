"use client";

import { useState } from "react";
import {
  Flame,
  Coffee,
  Layers,
  Droplets,
  Scale,
  ShoppingBag,
  Clock,
  Heart,
  Check,
} from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import type { Mug } from "@/lib/data";

const THUMBS = ["handle detail", "inside the rim", "base + stamp", "in a hand"];

const SPEC_ICON: Record<string, typeof Coffee> = {
  Holds: Coffee,
  Body: Layers,
  Dishwasher: Droplets,
  Weight: Scale,
};

export default function ProductDetail({ mug }: { mug: Mug }) {
  const [glazeIdx, setGlazeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const glaze = mug.glazes[glazeIdx];
  const lineTotal = mug.price * qty;

  const { add, setOpen } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(mug.slug);

  function addToCart() {
    add(mug.slug, glaze.name, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const specs = [
    { k: "Holds", v: `${mug.oz} oz / ${Math.round(mug.oz * 29.57)} ml to the rim` },
    { k: "Body", v: "Grey stoneware, fired to 1240°C" },
    { k: "Dishwasher", v: "Yes. Microwave too." },
    { k: "Weight", v: "About 340 g - varies a bit" },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
      <div className="flex flex-col gap-3.5">
        <PlaceholderPhoto
          label={glaze.shot}
          rounded="rounded-[28px]"
          className="aspect-square p-4"
        />
        <div className="grid grid-cols-4 gap-3">
          {THUMBS.map((t) => (
            <PlaceholderPhoto
              key={t}
              label={t}
              rounded="rounded-[16px]"
              padding="p-2"
              className="aspect-square text-[9.5px]"
            />
          ))}
        </div>
      </div>

      <div>
        <span className="badge">
          <Flame size={12} strokeWidth={2} aria-hidden />
          Kiln 41 · 12 made
        </span>
        <div className="flex items-start gap-3 mt-4">
          <h1 className="display-2">{mug.name}</h1>
          <button
            type="button"
            onClick={() => toggle(mug.slug)}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            className="ml-auto mt-1 grid place-items-center w-10 h-10 flex-none rounded-full border border-rule-strong text-ink-soft cursor-pointer transition-colors hover:text-terracotta hover:border-ink"
          >
            <Heart
              size={17}
              strokeWidth={1.7}
              className={wished ? "fill-terracotta text-terracotta" : ""}
            />
          </button>
        </div>
        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-2xl font-medium">₹{mug.price}</span>
          <span className="text-sm text-ink-faint">
            {mug.oz} oz · wheel-thrown stoneware
          </span>
        </div>
        <p className="lede text-[0.95rem] mt-5">
          A proper everyday mug: heavy enough to feel like something, light
          enough to hold with two fingers. The handle is pulled by hand, so
          it fits a hand.
        </p>

        {mug.glazes.length > 1 && (
          <div className="mt-8">
            <div className="flex items-baseline gap-2.5">
              <span className="kicker">Glaze</span>
              <span className="text-sm font-medium">{glaze.name}</span>
              <span className="text-xs text-ink-faint">{glaze.desc}</span>
            </div>
            <div className="flex gap-3 mt-3.5">
              {mug.glazes.map((g, i) => (
                <button
                  key={g.name}
                  onClick={() => setGlazeIdx(i)}
                  title={g.name}
                  aria-label={`Choose glaze ${g.name}`}
                  className="w-[42px] h-[42px] rounded-full cursor-pointer transition-transform hover:scale-105"
                  style={{
                    background: g.hex,
                    boxShadow:
                      i === glazeIdx
                        ? "0 0 0 2px var(--paper), 0 0 0 4px var(--ink)"
                        : "inset 0 0 0 1px rgba(31,29,27,.18)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col min-[420px]:flex-row gap-3 mt-8 items-stretch min-[420px]:items-center">
          <div className="flex items-center justify-between min-[420px]:justify-start gap-3.5 border border-rule-strong rounded-full px-4 py-2.5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="cursor-pointer text-lg text-ink-soft leading-none hover:text-ink px-1"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="text-base min-w-[14px] text-center">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              className="cursor-pointer text-lg text-ink-soft leading-none hover:text-ink px-1"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button onClick={addToCart} className="btn btn-primary flex-1">
            {added ? (
              <Check size={16} strokeWidth={2} aria-hidden />
            ) : (
              <ShoppingBag size={16} strokeWidth={1.8} aria-hidden />
            )}
            {added ? "Added" : `Add to cart — ₹${lineTotal}`}
          </button>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-terracotta-dark mt-3">
          <Clock size={13} strokeWidth={1.8} aria-hidden />
          Only {mug.left} in {glaze.name}. Next firing opens 19 Sept.
        </p>

        <div className="flex flex-col border-t border-rule mt-8">
          {specs.map((s) => {
            const SpecIcon = SPEC_ICON[s.k];
            return (
              <div
                key={s.k}
                className="flex gap-4 py-3.5 border-b border-rule text-sm"
              >
                <span className="flex w-[120px] flex-none items-center gap-2 text-ink-faint">
                  {SpecIcon && <SpecIcon size={14} strokeWidth={1.7} aria-hidden />}
                  {s.k}
                </span>
                <span>{s.v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
