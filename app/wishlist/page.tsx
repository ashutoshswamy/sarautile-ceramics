"use client";

import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { findMug } from "@/lib/data";

export default function WishlistPage() {
  const { slugs, remove } = useWishlist();
  const { add, setOpen } = useCart();

  const mugs = slugs
    .map((slug) => findMug(slug))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div className="container-x section-tight max-w-[900px]">
      <div className="flex items-baseline gap-3">
        <h1 className="display-2">Wishlist</h1>
        <span className="text-sm text-ink-faint">
          {mugs.length} {mugs.length === 1 ? "mug" : "mugs"}
        </span>
      </div>

      {mugs.length === 0 ? (
        <div className="card p-8 mt-8 flex flex-col items-start gap-3">
          <Heart size={22} strokeWidth={1.6} className="text-terracotta" />
          <p className="lede text-[0.95rem]">
            Nothing saved yet. Tap the heart on any mug to keep it here.
          </p>
          <Link href="/mugs" className="btn btn-primary mt-1">
            Browse the mugs
          </Link>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {mugs.map((mug) => {
            const glaze = mug.glazes[0];
            return (
              <div key={mug.slug} className="flex flex-col gap-2">
                <div className="relative mug-card__media rounded-2xl">
                  <Link href={`/mugs/${mug.slug}`}>
                    <PlaceholderPhoto
                      label={mug.photoLabel}
                      rounded="rounded-2xl"
                      className="aspect-square"
                    />
                  </Link>
                  <button
                    onClick={() => remove(mug.slug)}
                    aria-label={`Remove ${mug.name} from wishlist`}
                    className="absolute top-2.5 right-2.5 grid place-items-center w-9 h-9 rounded-full border border-rule bg-paper/85 backdrop-blur-sm text-ink-soft cursor-pointer transition-colors hover:text-terracotta"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/mugs/${mug.slug}`}
                    className="font-medium text-ink no-underline hover:text-terracotta-hover"
                  >
                    {mug.name}
                  </Link>
                  <span className="ml-auto font-medium">₹{mug.price}</span>
                </div>
                <span className="text-sm text-ink-soft">{mug.note}</span>
                <button
                  onClick={() => {
                    add(mug.slug, glaze.name, 1);
                    setOpen(true);
                  }}
                  className="btn btn-ghost mt-1 h-10 text-[0.8rem]"
                >
                  <ShoppingBag size={15} strokeWidth={1.8} />
                  Add to cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
