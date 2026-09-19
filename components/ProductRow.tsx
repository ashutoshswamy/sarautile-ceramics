"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/data";

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
    <section className="container-x section-tight rise">
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
        <button
          onClick={() => scrollBy(-1)}
          aria-label={`Scroll ${title} left`}
          className="grid place-items-center w-9 h-9 rounded-full bg-terracotta text-paper cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label={`Scroll ${title} right`}
          className="grid place-items-center w-9 h-9 rounded-full bg-terracotta text-paper cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
