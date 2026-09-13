import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import type { Mug } from "@/lib/data";

export default function ShopByCategory({
  categories,
}: {
  categories: { slug: string; name: string; mugs: Mug[] }[];
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
            href={`/mugs?category=${c.slug}`}
            className="group relative block rounded-2xl overflow-hidden no-underline"
          >
            <PlaceholderPhoto
              label={c.mugs[0].photoLabel}
              rounded="rounded-none"
              className="aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(38,70,83,0.55)] via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
              <span className="block text-base font-medium">{c.name}</span>
              <span className="block text-xs opacity-80">
                {c.mugs.length} {c.mugs.length === 1 ? "mug" : "mugs"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
