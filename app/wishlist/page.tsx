"use client";

import { useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, ShoppingBag, X } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { useProducts } from "@/components/ProductsContext";
import { useHoverTween } from "@/lib/gsap";

function WishlistCard({
  product,
  onRemove,
  onAdd,
}: {
  product: { slug: string; name: string; price: number; photoLabel: string; imageUrl: string | null };
  onRemove: () => void;
  onAdd: () => void;
}) {
  const removeRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLAnchorElement>(null);
  useHoverTween(removeRef, { color: "var(--terracotta)" });
  useHoverTween(nameRef, { color: "var(--terracotta-hover)" });

  return (
    <div className="flex flex-col gap-2">
      <div className="relative product-card__media rounded-2xl">
        <Link href={`/products/${product.slug}`}>
          <PlaceholderPhoto
            label={product.photoLabel}
            src={product.imageUrl}
            rounded="rounded-2xl"
            className="aspect-square"
          />
        </Link>
        <button
          ref={removeRef}
          onClick={onRemove}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-2.5 right-2.5 grid place-items-center w-9 h-9 rounded-full border border-rule bg-paper/85 backdrop-blur-sm text-ink-soft cursor-pointer"
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>
      <div className="flex items-baseline gap-2">
        <Link
          ref={nameRef}
          href={`/products/${product.slug}`}
          className="font-medium text-ink no-underline"
        >
          {product.name}
        </Link>
        <span className="ml-auto font-medium">₹{product.price}</span>
      </div>
      <button onClick={onAdd} className="btn btn-ghost mt-1 h-10 text-[0.8rem]">
        <ShoppingBag size={15} strokeWidth={1.8} />
        Add to cart
      </button>
    </div>
  );
}

export default function WishlistPage() {
  const { user } = useUser();
  const { slugs, remove } = useWishlist();
  const { add, setOpen } = useCart();
  const { findProduct } = useProducts();

  const products = slugs
    .map((slug) => findProduct(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!user) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <Heart size={22} strokeWidth={1.6} className="text-terracotta" />
        <h1 className="display-2">Sign in to see your wishlist</h1>
        <p className="lede text-[0.95rem]">
          Saved pieces live on your account, so sign in to keep them.
        </p>
        <Link href="/signin?redirect_url=/wishlist" className="btn btn-primary mt-2">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x section-tight max-w-[900px]">
      <div className="flex items-baseline gap-3">
        <h1 className="display-2">Wishlist</h1>
        <span className="text-sm text-ink-faint">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="card p-8 mt-8 flex flex-col items-start gap-3">
          <Heart size={22} strokeWidth={1.6} className="text-terracotta" />
          <p className="lede text-[0.95rem]">
            Nothing saved yet. Tap the heart on any piece to keep it here.
          </p>
          <Link href="/products" className="btn btn-primary mt-1">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {products.map((product) => (
            <WishlistCard
              key={product.slug}
              product={product}
              onRemove={() => remove(product.slug)}
              onAdd={() => {
                add(product.slug, 1);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
