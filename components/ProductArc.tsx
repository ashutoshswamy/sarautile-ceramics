"use client";

import { useRouter } from "next/navigation";
import ArcFlowCarousel from "@/components/ui/arc-flow-carousel";
import type { Product } from "@/lib/data";

export default function ProductArc({ products }: { products: Product[] }) {
  const router = useRouter();
  const withPhotos = products.filter((p) => p.imageUrl);

  return (
    <ArcFlowCarousel
      items={withPhotos.map((p) => ({
        src: p.imageUrl!,
        alt: p.photoLabel,
        title: p.name,
        description: `₹${p.price.toLocaleString("en-IN")}`,
      }))}
      onItemClick={(i) => router.push(`/products/${withPhotos[i].slug}`)}
      cardRatio={0.3}
      minCardWidth={190}
      maxCardWidth={420}
      cardAspect={0.8}
      autoRotateSpeed={0.12}
      surfaceColor="#fff7ed" // --paper
      className="h-[min(85svh,760px)]"
    />
  );
}
