"use client";

import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import type { Product } from "@/lib/data";

export default function ProductCard({
  product,
  badge,
}: {
  product: Product;
  badge: string;
}) {
  const { add, setOpen } = useCart();

  function handleAdd() {
    add(product.slug);
    setOpen(true);
  }

  return (
    <div className="shrink-0 w-[240px] sm:w-[260px] snap-start flex flex-col">
      <div className="relative">
        <span className="absolute top-3 left-3 z-[1] rounded-md bg-terracotta px-2.5 py-1 text-[11px] font-semibold text-paper">
          {badge}
        </span>
        <Link href={`/products/${product.slug}`}>
          <PlaceholderPhoto
            label={product.photoLabel}
            src={product.imageUrl}
            rounded="rounded-none"
            className="aspect-square"
          />
        </Link>
      </div>
      <div className="bg-paper-tint border border-t-0 border-rule px-4 py-4 flex flex-col gap-3">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm text-ink no-underline hover:text-terracotta-hover"
        >
          {product.name}
        </Link>
        <span className="font-medium text-ink">₹{product.price}</span>
        <button onClick={handleAdd} className="btn bg-ink text-paper w-full">
          Add to cart
        </button>
      </div>
    </div>
  );
}
