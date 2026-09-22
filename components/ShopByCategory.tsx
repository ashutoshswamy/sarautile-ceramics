"use client";

import { useRef } from "react";
import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import Reveal from "@/components/Reveal";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Product } from "@/lib/data";

function CategoryCard({
  slug,
  name,
  products,
}: {
  slug: string;
  name: string;
  products: Product[];
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
      className="group relative block rounded-2xl overflow-hidden no-underline"
    >
      <div ref={imgRef} className="aspect-[4/5]">
        <PlaceholderPhoto
          label={products[0].photoLabel}
          src={products[0].imageUrl}
          rounded="rounded-none"
          className="h-full w-full"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(38,70,83,0.55)] via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
        <span className="block text-base font-medium">{name}</span>
        <span className="block text-xs opacity-80">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
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
        {categories.map((c) => (
          <CategoryCard key={c.slug} slug={c.slug} name={c.name} products={c.products} />
        ))}
      </div>
    </Reveal>
  );
}
