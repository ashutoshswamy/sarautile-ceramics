"use client";

import { useRef, useState } from "react";
import { Layers, Droplets, Scale, ShoppingBag, Heart, Check } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { gsap, useGSAP, useHoverTween } from "@/lib/gsap";
import { linePrice } from "@/lib/cart";
import type { Product } from "@/lib/data";

const SPEC_ICON: Record<string, typeof Layers> = {
  Body: Layers,
  Dishwasher: Droplets,
  Weight: Scale,
};

export default function ProductDetail({ product }: { product: Product }) {
  const soldOut = product.stock < 1;
  const [qty, setQty] = useState(soldOut ? 0 : 1);
  const [added, setAdded] = useState(false);
  const lineTotal = linePrice(product.price, product.setPrice, product.setSize, Math.max(qty, 1));
  const setSaving = product.setPrice ? product.price * product.setSize - product.setPrice : 0;

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
    if (soldOut) return;
    add(product.slug, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const specs = product.weight ? [{ k: "Weight", v: product.weight }] : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
      <ProductGallery
        label={product.photoLabel}
        srcs={[product.imageUrl, ...product.images].filter(Boolean)}
      />

      <div className="lg:sticky lg:top-28 lg:self-start">
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
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              soldOut
                ? "bg-neutral-bg text-neutral-ink"
                : product.stock <= 3
                  ? "bg-warn-bg text-warn-ink"
                  : "bg-sage-bg text-sage-ink"
            }`}
          >
            {soldOut ? "Sold out" : product.stock <= 3 ? product.left : "In stock"}
          </span>
        </div>
        {setSaving > 0 && product.stock >= product.setSize && (
          <button
            type="button"
            onClick={() => setQty(product.setSize)}
            className="mt-3 cursor-pointer rounded-full bg-sage-bg px-3 py-1.5 text-xs font-medium text-sage-ink"
          >
            Set of {product.setSize} for ₹{product.setPrice}, save ₹{setSaving}
          </button>
        )}
        <p className="lede text-[0.95rem] mt-5">
          {product.description ||
            "A proper everyday piece: heavy enough to feel like something, light enough to handle with ease. Every curve is finished by hand, so it fits a hand."}
        </p>

        <div className="flex flex-col min-[420px]:flex-row gap-3 mt-8 items-stretch min-[420px]:items-center">
          <div
            className={`flex items-center justify-between min-[420px]:justify-start gap-1 border border-rule-strong rounded-full p-1 ${
              soldOut ? "opacity-50" : "bg-paper-tint"
            }`}
          >
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={soldOut || qty <= 1}
              className="grid h-9 w-9 place-items-center rounded-full text-lg leading-none text-ink-soft transition-colors enabled:cursor-pointer enabled:hover:bg-canvas enabled:hover:text-ink disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-8 text-center text-base tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(9, product.stock, q + 1))}
              disabled={soldOut || qty >= Math.min(9, product.stock)}
              className="grid h-9 w-9 place-items-center rounded-full text-lg leading-none text-ink-soft transition-colors enabled:cursor-pointer enabled:hover:bg-canvas enabled:hover:text-ink disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={addToCart}
            disabled={soldOut}
            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {added ? (
              <Check size={16} strokeWidth={2} aria-hidden />
            ) : (
              <ShoppingBag size={16} strokeWidth={1.8} aria-hidden />
            )}
            {soldOut ? "Out of stock" : added ? "Added" : `Add to cart, ₹${lineTotal}`}
          </button>
        </div>
        <div className="mt-8 flex flex-col rounded-2xl bg-canvas px-5 py-1 empty:hidden">
          {specs.map((s) => {
            const SpecIcon = SPEC_ICON[s.k];
            return (
              <div
                key={s.k}
                className="flex gap-4 py-3.5 text-sm"
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
