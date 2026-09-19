import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import type { Product } from "@/lib/data";

export default function ShopByCategory({
  categories,
}: {
  categories: { slug: string; name: string; products: Product[] }[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="container-x section-tight rise">
      <div className="mb-8">
        <span className="kicker">Browse</span>
        <h2 className="display-2 mt-2">Shop by category</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="group relative block rounded-2xl overflow-hidden no-underline"
          >
            <PlaceholderPhoto
              label={c.products[0].photoLabel}
              src={c.products[0].imageUrl}
              rounded="rounded-none"
              className="aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(38,70,83,0.55)] via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
              <span className="block text-base font-medium">{c.name}</span>
              <span className="block text-xs opacity-80">
                {c.products.length} {c.products.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
