import Link from "next/link";
import { ArrowUpDown, Amphora } from "lucide-react";
import ProductGridCard from "@/components/ProductGridCard";
import SortSelect from "@/components/SortSelect";
import { SORT_OPTIONS, type SortValue } from "@/lib/sort";
import { getProducts, getCategories } from "@/lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All the ceramics - Sara Utile Ceramics",
};

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const categorySlug =
    typeof searchParams.category === "string" ? searchParams.category : undefined;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const sort: SortValue = SORT_OPTIONS.some((o) => o.value === sortParam)
    ? (sortParam as SortValue)
    : "newest";

  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  let products = activeCategory
    ? allProducts.filter((p) => p.categorySlug === activeCategory.slug)
    : allProducts;
  if (query) {
    const q = query.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(q));
  }

  // getProducts() returns oldest-first (DB order); "newest" just reverses it.
  products = [...products];
  if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  else if (sort === "newest") products.reverse();

  return (
    <div className="container-x section-tight grid gap-10 md:grid-cols-[236px_1fr] lg:gap-14">
      <aside className="flex flex-col gap-8 md:sticky md:top-20 md:self-start">
        <div>
          <h1 className="display-2">
            {query ? `Results for "${query}"` : (activeCategory?.name ?? "All the ceramics")}
          </h1>
          <p className="lede text-[0.95rem] mt-3">
            {query ? `${products.length} matching` : `${allProducts.length} in the catalog today.`}
          </p>
        </div>

        {categories.length > 0 && (
          <div>
            <span className="kicker">Category</span>
            <div className="flex flex-col gap-2 mt-3.5">
              <Link
                href="/products"
                className={`px-3 py-1.5 rounded-full border text-sm no-underline transition-colors ${
                  !activeCategory
                    ? "border-ink bg-ink text-paper"
                    : "border-rule text-ink hover:border-rule-strong"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className={`px-3 py-1.5 rounded-full border text-sm no-underline transition-colors ${
                    activeCategory?.slug === c.slug
                      ? "border-ink bg-ink text-paper"
                      : "border-rule text-ink hover:border-rule-strong"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {products.length === 0 ? (
          <div className="card p-8 flex flex-col items-start gap-3">
            <Amphora size={22} strokeWidth={1.6} className="text-terracotta" />
            <p className="lede text-[0.95rem]">
              {query
                ? `Nothing matches "${query}".`
                : activeCategory
                  ? `Nothing in ${activeCategory.name} yet.`
                  : "Nothing in the shop yet - check back soon."}
            </p>
            {(activeCategory || query) && (
              <Link href="/products" className="btn btn-ghost mt-1">
                See everything
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8 text-sm text-ink-soft">
              <span>{products.length} pieces</span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <ArrowUpDown size={13} strokeWidth={1.7} aria-hidden />
                <SortSelect value={sort} />
              </span>
            </div>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductGridCard key={product.slug} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
