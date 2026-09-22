"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import Reveal from "@/components/Reveal";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Product } from "@/lib/data";

// Cycled pastel chip backgrounds, matching the "Clayful" palette in globals.css.
const CHIP_BG = ["bg-terracotta-light", "bg-neutral-bg", "bg-sage-bg", "bg-gold-bg", "bg-warn-bg"];

function CategoryCard({
  slug,
  name,
  products,
  bg,
}: {
  slug: string;
  name: string;
  products: Product[];
  bg: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const card = cardRef.current;
    const img = imgRef.current;
    if (!card || !img) return;
    const tween = gsap.to(img, { scale: 1.05, duration: 0.3, ease: "power2.out", paused: true });
    const enter = () => tween.play();
    const leave = () => tween.reverse();
    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
    return () => {
      card.removeEventListener("mouseenter", enter);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/products?category=${slug}`}
      className={`group relative block rounded-2xl overflow-hidden no-underline p-4 ${bg}`}
    >
      <div ref={imgRef} className="aspect-square rounded-xl overflow-hidden">
        <PlaceholderPhoto
          label={products[0].photoLabel}
          src={products[0].imageUrl}
          rounded="rounded-none"
          className="h-full w-full"
        />
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <span className="block text-base font-medium text-ink">{name}</span>
          <span className="block text-xs text-ink-soft">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </span>
        </div>
        <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-[var(--paper-tint)] text-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function ShopByCategory({
  categories,
}: {
  categories: { slug: string; name: string; products: Product[] }[];
}) {
  if (categories.length === 0) return null;

  return (
    <Reveal as="section" className="container-x section-tight">
      <div className="mb-8">
        <span className="kicker">Browse</span>
        <h2 className="display-2 mt-2">Shop by category</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {categories.map((c, i) => (
          <CategoryCard
            key={c.slug}
            slug={c.slug}
            name={c.name}
            products={c.products}
            bg={CHIP_BG[i % CHIP_BG.length]}
          />
        ))}
      </div>
    </Reveal>
  );
}
