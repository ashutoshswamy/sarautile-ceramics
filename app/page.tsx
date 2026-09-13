import Link from "next/link";
import { ArrowRight, Palette, Flame, Hand } from "lucide-react";
import Hero from "@/components/Hero";
import KilnNotify from "@/components/KilnNotify";
import ProductRow from "@/components/ProductRow";
import ShopByCategory from "@/components/ShopByCategory";
import { wholesaleFacts } from "@/lib/data";
import { getCollection, getCategoriesWithMugs, getGlazeFilters } from "@/lib/queries";

// Same catalog/hero data as /mugs, which is already dynamic - prerendering
// this at build time made a slow/unreachable Supabase response fail the
// whole deploy (see "Gateway Timeout" prerendering "/").
export const dynamic = "force-dynamic";

const VALUES = [
  {
    Icon: Palette,
    title: "We mix the glazes",
    body: "Five recipes, ground in a bucket out back. Ember is the one everyone comes for.",
  },
  {
    Icon: Flame,
    title: "One firing a fortnight",
    body: "The kiln takes what it takes. Sign up and we'll nudge you when the door opens.",
  },
  {
    Icon: Hand,
    title: "Made to be used",
    body: "Chip it, stain it, love it. And if it arrives broken we'll throw you another.",
  },
];

export default async function Home() {
  const [newArrivals, bestSellers, categories, glazeFilters] = await Promise.all([
    getCollection("new-arrivals"),
    getCollection("bestsellers"),
    getCategoriesWithMugs(),
    getGlazeFilters(),
  ]);

  return (
    <>
      <Hero />

      <ProductRow title="New arrivals" badge="New arrival" mugs={newArrivals} />

      <ProductRow title="Our bestsellers" badge="Best seller" mugs={bestSellers} />

      <ShopByCategory categories={categories} />

      <section className="bg-sand border-y border-rule">
        <div className="container-x section grid gap-x-8 gap-y-10 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rise">
              <value.Icon
                size={22}
                strokeWidth={1.6}
                className="text-terracotta"
                aria-hidden
              />
              <h3 className="display-3 mt-3.5">{value.title}</h3>
              <p className="lede text-[0.95rem] mt-2.5">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      {glazeFilters.length > 0 && (
        <section className="container-x section-tight rise">
          <div className="mb-8">
            <span className="kicker">Glazes, mixed by hand</span>
            <h2 className="display-2 mt-2">Pick a colour</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {glazeFilters.map((g) => (
              <Link
                key={g.name}
                href="/mugs"
                className="group flex flex-col gap-3 no-underline"
              >
                <span
                  className="aspect-square block rounded-2xl shadow-[inset_0_0_0_1px_rgba(38,70,83,0.14)] transition-transform group-hover:-translate-y-1"
                  style={{ background: g.hex }}
                  aria-hidden
                />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {g.name}
                  </span>
                  <span className="block text-xs text-ink-faint mt-0.5">
                    {g.desc}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-x section-tight">
        <div className="bg-[var(--ink)] text-paper rounded-3xl p-8 sm:p-12 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center rise">
          <div>
            <span className="kicker text-terracotta-light">Wholesale</span>
            <h2 className="display-2 mt-2 text-paper">
              Fitting out a café or a shop?
            </h2>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-paper/70 max-w-[48ch]">
              {wholesaleFacts[0].v} per order, {wholesaleFacts[1].v.toLowerCase()}
              , at {wholesaleFacts[2].v.toLowerCase()}. Your stamp on the base,
              no charge.
            </p>
          </div>
          <Link
            href="/wholesale"
            className="btn bg-paper text-ink justify-self-start md:justify-self-end"
          >
            Wholesale terms <ArrowRight size={16} strokeWidth={1.7} aria-hidden />
          </Link>
        </div>
      </section>

      <section className="container-x section-tight border-t border-rule rise">
        <div className="max-w-md">
          <span className="kicker">One firing a fortnight</span>
          <h2 className="display-2 mt-2">Get a text when the kiln opens</h2>
          <p className="lede text-[0.95rem] mt-2.5 mb-6">
            No spam, no weekly newsletter - just a heads up when a fresh batch
            is ready to buy, before it sells out.
          </p>
          <KilnNotify />
        </div>
      </section>
    </>
  );
}
