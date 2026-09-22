"use client";

import { useRef } from "react";
import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import WishlistButton from "@/components/WishlistButton";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Product } from "@/lib/data";

export default function ProductGridCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const card = cardRef.current;
    const name = nameRef.current;
    if (!card || !name) return;
    const media = card.querySelector<HTMLElement>(".product-card__media");
    const photo = card.querySelector<HTMLElement>(".ph-photo");
    if (!media || !photo) return;

    const tl = gsap.timeline({ paused: true });
    tl.to(media, { y: -4, duration: 0.25, ease: "power2.out" }, 0);
    tl.to(photo, { scale: 1.04, duration: 0.4, ease: "power2.out" }, 0);
    tl.to(name, { color: "var(--terracotta-hover)", duration: 0.15, ease: "power2.out" }, 0);

    const enter = () => tl.play();
    const leave = () => tl.reverse();
    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
    return () => {
      card.removeEventListener("mouseenter", enter);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={cardRef} className="product-card relative">
      <div className="product-card__media relative">
        <Link href={`/products/${product.slug}`} className="block aspect-square" tabIndex={-1} aria-hidden>
          <PlaceholderPhoto
            label={product.photoLabel}
            src={product.imageUrl}
            rounded="rounded-none"
            className="w-full h-full"
          />
        </Link>
        <WishlistButton slug={product.slug} className="absolute top-2.5 right-2.5" />
      </div>
      <div className="flex flex-col gap-1">
        <Link
          ref={nameRef}
          href={`/products/${product.slug}`}
          className="font-medium text-ink no-underline after:absolute after:inset-0 after:z-0"
        >
          {product.name}
        </Link>
        <span className="font-medium text-ink">₹{product.price}</span>
      </div>
    </div>
  );
}
