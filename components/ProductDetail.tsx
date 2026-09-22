"use client";

import { useRef, useState } from "react";
import { Layers, Droplets, Scale, ShoppingBag, Heart, Check } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { gsap, useGSAP, useHoverTween } from "@/lib/gsap";
import type { Product } from "@/lib/data";

const THUMBS = ["handle detail", "inside the rim", "base + stamp", "in a hand"];

const SPEC_ICON: Record<string, typeof Layers> = {
  Body: Layers,
  Dishwasher: Droplets,
  Weight: Scale,
};

export default function ProductDetail({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const lineTotal = product.price * qty;

  const { add, setOpen } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.slug);

  const wishBtnRef = useRef<HTMLButtonElement>(null);
  const wishHeartRef = useRef<SVGSVGElement>(null);
  const wishMounted = useRef(false);

  useHoverTween(wishBtnRef, { color: "var(--terracotta)", borderColor: "var(--ink)" });

  useGSAP(
    () => {
      if (!wishMounted.current) {
        wishMounted.current = true;
        return;
      }
      if (!wishHeartRef.current) return;
      gsap.fromTo(
        wishHeartRef.current,
        { scale: 1.35 },
        { scale: 1, duration: 0.35, ease: "back.out(3)" }
      );
    },
    { dependencies: [wished] }
  );

  function addToCart() {
    add(product.slug, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const specs = product.weight ? [{ k: "Weight", v: product.weight }] : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
      <div className="flex flex-col gap-3.5">
        <PlaceholderPhoto
          label={product.photoLabel}
          src={product.imageUrl}
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
        <div className="flex items-start gap-3">
          <h1 className="display-2">{product.name}</h1>
          <button
            ref={wishBtnRef}
            type="button"
            onClick={() => toggle(product.slug)}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            className="ml-auto mt-1 grid place-items-center w-10 h-10 flex-none rounded-full border border-rule-strong text-ink-soft cursor-pointer"
          >
            <Heart
              ref={wishHeartRef}
              size={17}
              strokeWidth={1.7}
              className={wished ? "fill-terracotta text-terracotta" : ""}
            />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-3xl font-medium tracking-tight">₹{product.price}</span>
          <span className="rounded-full bg-warn-bg px-2.5 py-1 text-xs font-medium text-warn-ink">
            {product.left}
          </span>
        </div>
        <p className="lede text-[0.95rem] mt-5">
          {product.description ||
            "A proper everyday piece: heavy enough to feel like something, light enough to handle with ease. Every curve is finished by hand, so it fits a hand."}
        </p>

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
        <div className="flex flex-col border-t border-rule mt-8 empty:hidden">
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
