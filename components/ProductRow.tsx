"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { useHoverTween } from "@/lib/gsap";
import type { Product } from "@/lib/data";

function NavButton({
  dir,
  label,
  onClick,
}: {
  dir: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useHoverTween(ref, { y: -2 });
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={label}
      className="grid place-items-center w-9 h-9 rounded-full bg-terracotta text-paper cursor-pointer"
    >
      {dir === "left" ? (
        <ChevronLeft size={16} strokeWidth={2} />
      ) : (
        <ChevronRight size={16} strokeWidth={2} />
      )}
    </button>
  );
}

export default function ProductRow({
  title,
  badge,
  products,
}: {
  title: string;
  badge: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollBy(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  return (
    <Reveal as="section" className="container-x section-tight">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="display-2">{title}</h2>
        <Link href="/products" className="btn btn-primary ml-auto shrink-0">
          Shop all
        </Link>
      </div>

      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} badge={badge} />
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <NavButton dir="left" label={`Scroll ${title} left`} onClick={() => scrollBy(-1)} />
        <NavButton dir="right" label={`Scroll ${title} right`} onClick={() => scrollBy(1)} />
      </div>
    </Reveal>
  );
}
