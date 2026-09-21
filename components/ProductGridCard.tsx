import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import WishlistButton from "@/components/WishlistButton";
import type { Product } from "@/lib/data";

export default function ProductGridCard({ product }: { product: Product }) {
  return (
    <div className="product-card group relative">
      <div className="product-card__media relative">
        <PlaceholderPhoto
          label={product.photoLabel}
          src={product.imageUrl}
          rounded="rounded-none"
          className="aspect-square"
        />
        <WishlistButton slug={product.slug} className="absolute top-2.5 right-2.5" />
      </div>
      <div className="flex flex-col gap-1">
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-ink no-underline transition-colors group-hover:text-terracotta-hover after:absolute after:inset-0 after:z-0"
        >
          {product.name}
        </Link>
        <span className="font-medium text-ink">₹{product.price}</span>
      </div>
    </div>
  );
}
