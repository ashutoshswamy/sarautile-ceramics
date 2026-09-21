import Link from "next/link";
import { ArrowRight, Palette, Flame, Hand } from "lucide-react";
import Hero from "@/components/Hero";
import KilnNotify from "@/components/KilnNotify";
import ProductRow from "@/components/ProductRow";
import ShopByCategory from "@/components/ShopByCategory";
import ShopByCollection from "@/components/ShopByCollection";
import InstagramFeed from "@/components/InstagramFeed";
import { wholesaleFacts } from "@/lib/data";
import {
  getCollection,
  getCategoriesWithProducts,
  getCollectionsWithProducts,
  getInstagramPosts,
} from "@/lib/queries";

// Same catalog/hero data as /products, which is already dynamic - prerendering
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
  const [newArrivals, bestSellers, categories, collections, instagramPosts] = await Promise.all([
    getCollection("new-arrivals"),
    getCollection("bestsellers"),
    getCategoriesWithProducts(),
    getCollectionsWithProducts(),
    getInstagramPosts(),
  ]);

  return (
    <>
      <Hero />

      <ProductRow title="New arrivals" badge="New arrival" products={newArrivals} />

      <ProductRow title="Our bestsellers" badge="Best seller" products={bestSellers} />

      <ShopByCategory categories={categories} />

      <ShopByCollection collections={collections} />

      <section className="bg-sand border-y border-rule">
        <div className="container-x section">
          <div className="mb-10 text-center">
            <span className="kicker">Behind the scenes</span>
            <h2 className="display-2 mt-2">How we work</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className="rise relative bg-paper border border-rule rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(38,70,83,0.35)]"
              >
                <span className="absolute top-6 right-7 text-[2.5rem] font-semibold leading-none text-ink/[0.05] select-none">
                  0{i + 1}
                </span>
                <div className="grid place-items-center w-12 h-12 rounded-full bg-terracotta/10">
                  <value.Icon size={22} strokeWidth={1.6} className="text-terracotta" aria-hidden />
                </div>
                <h3 className="display-3 mt-5">{value.title}</h3>
                <p className="lede text-[0.95rem] mt-2.5">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <InstagramFeed posts={instagramPosts} />
    </>
  );
}
