import Link from "next/link";
import { ArrowUpDown, Coffee } from "lucide-react";
import MugCard from "@/components/MugCard";
import { getMugs, getGlazeFilters, getCategories } from "@/lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All the mugs - Sarautile Ceramics",
};

export default async function MugsPage(props: PageProps<"/mugs">) {
  const searchParams = await props.searchParams;
  const categorySlug =
    typeof searchParams.category === "string" ? searchParams.category : undefined;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const [allMugs, glazeFilters, categories] = await Promise.all([
    getMugs(),
    getGlazeFilters(),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  let mugs = activeCategory
    ? allMugs.filter((m) => m.categorySlug === activeCategory.slug)
    : allMugs;
  if (query) {
    const q = query.toLowerCase();
    mugs = mugs.filter(
      (m) => m.name.toLowerCase().includes(q) || m.note.toLowerCase().includes(q)
    );
  }

  return (
    <div className="container-x section-tight grid gap-10 md:grid-cols-[236px_1fr] lg:gap-14">
      <aside className="flex flex-col gap-8 md:sticky md:top-20 md:self-start">
        <div>
          <h1 className="display-2">
            {query ? `Results for "${query}"` : (activeCategory?.name ?? "All the mugs")}
          </h1>
          <p className="lede text-[0.95rem] mt-3">
            {query ? `${mugs.length} matching` : `${allMugs.length} in the catalog today.`}
          </p>
        </div>

        {categories.length > 0 && (
          <div>
            <span className="kicker">Category</span>
            <div className="flex flex-col gap-2 mt-3.5">
              <Link
                href="/mugs"
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
                  href={`/mugs?category=${c.slug}`}
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

        {glazeFilters.length > 0 && (
          <div>
            <span className="kicker">Glaze</span>
            <div className="flex flex-col gap-2 mt-3.5">
              {glazeFilters.map((g) => (
                <span
                  key={g.name}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-rule text-sm"
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-[inset_0_0_0_1px_rgba(31,29,27,.18)]"
                    style={{ background: g.hex }}
                  />
                  {g.name}
                  <span className="ml-auto text-xs text-ink-faint">
                    {g.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {mugs.length === 0 ? (
          <div className="card p-8 flex flex-col items-start gap-3">
            <Coffee size={22} strokeWidth={1.6} className="text-terracotta" />
            <p className="lede text-[0.95rem]">
              {query
                ? `No mugs match "${query}".`
                : activeCategory
                  ? `Nothing in ${activeCategory.name} yet.`
                  : "Nothing in the shop yet - check back soon."}
            </p>
            {(activeCategory || query) && (
              <Link href="/mugs" className="btn btn-ghost mt-1">
                See all mugs
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8 text-sm text-ink-soft">
              <span>{mugs.length} mugs</span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <ArrowUpDown size={13} strokeWidth={1.7} aria-hidden />
                Sort: newest firing
              </span>
            </div>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {mugs.map((mug) => (
                <MugCard key={mug.slug} mug={mug} showLeft />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
