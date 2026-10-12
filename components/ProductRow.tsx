"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
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
  if (products.length === 0) return null;

  return (
    <Reveal as="section" className="container-x section-tight">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="display-2">{title}</h2>
        <Link href="/products" className="btn btn-primary ml-auto shrink-0">
          Shop all
        </Link>
      </div>

      <div
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} badge={badge} />
        ))}
      </div>
    </Reveal>
  );
}
