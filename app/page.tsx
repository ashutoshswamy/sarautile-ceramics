import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/Hero";
import KilnNotify from "@/components/KilnNotify";
import ProductArc from "@/components/ProductArc";
import ProductRow from "@/components/ProductRow";
import ShopByCategory from "@/components/ShopByCategory";
import ShopByCollection from "@/components/ShopByCollection";
import InstagramFeed from "@/components/InstagramFeed";
import Reveal from "@/components/Reveal";
import {
  getCollection,
  getProducts,
  getCategoriesWithProducts,
  getCollectionsWithProducts,
  getInstagramPosts,
} from "@/lib/queries";

// Same catalog/hero data as /products, which is already dynamic - prerendering
// this at build time made a slow/unreachable Supabase response fail the
// whole deploy (see "Gateway Timeout" prerendering "/").
export const dynamic = "force-dynamic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Grid placement per step: wide + narrow on the first row, full-width last.
const VALUES = [
  {
    image: "/step1.png",
    stage: "Glaze",
    title: "We mix the glazes",
    body: "Five recipes, ground in a bucket out back. Ember is the one everyone comes for.",
    tile: "bg-neutral-bg md:col-span-7",
    ink: "text-neutral-ink",
    pill: "bg-neutral-ink/10 text-neutral-ink",
    tilt: "-rotate-3 group-hover:-rotate-1",
    layout: "md:flex-row",
  },
  {
    image: "/step2.png",
    stage: "Kiln",
    title: "One firing a fortnight",
    body: "The kiln takes what it takes. Sign up and we'll nudge you when the door opens.",
    tile: "bg-gold-bg md:col-span-5 md:mt-14",
    ink: "text-gold-ink",
    pill: "bg-gold-ink/10 text-gold-ink",
    tilt: "rotate-2 group-hover:rotate-0",
    layout: "flex-col",
  },
  {
    image: "/step3.png",
    stage: "Home",
    title: "Made to be used",
    body: "Chip it, stain it, love it. And if it arrives broken we'll throw you another.",
    tile: "bg-sage-bg md:col-span-12",
    ink: "text-sage-ink",
    pill: "bg-sage-ink/10 text-sage-ink",
    tilt: "-rotate-2 group-hover:rotate-0",
    layout: "md:flex-row-reverse",
  },
];

export default async function Home() {
  const [allProducts, newArrivals, bestSellers, categories, collections, instagramPosts] = await Promise.all([
    getProducts(),
    getCollection("new-arrivals"),
    getCollection("bestsellers"),
    getCategoriesWithProducts(),
    getCollectionsWithProducts(),
    getInstagramPosts(),
  ]);

  return (
    <>
      <Hero />

      <section className="border-b border-rule">
        <div className="container-x pt-12">
          <span className="kicker">Fresh off the wheel</span>
          <h2 className="display-2 mt-2">Browse the shelf</h2>
        </div>
        <ProductArc products={allProducts.slice(0, 16)} />
      </section>

      <ProductRow title="New arrivals" badge="New arrival" products={newArrivals} />

      <ProductRow title="Our bestsellers" badge="Best seller" products={bestSellers} />

      <ShopByCategory categories={categories} />

      <ShopByCollection collections={collections} />

      <section className="bg-sand border-y border-rule">
        <div className="container-x section">
          <h2 className="font-display max-w-[14ch] text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
            How a mug gets made
          </h2>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-soft">
            Every batch goes the same way: mixed, fired, then sent off to get used.
          </p>
          <ol className="mt-12 grid gap-5 md:grid-cols-12 md:gap-6">
            {VALUES.map((value) => (
              <Reveal as="li" key={value.title} className={`group list-none ${value.tile} rounded-3xl shadow-card`}>
                <div className={`flex h-full flex-col items-center gap-8 p-7 sm:p-12 ${value.layout}`}>
                  <div className="relative grid flex-none place-items-center">
                    <span aria-hidden className="absolute inset-[-8%] rounded-full bg-paper/60" />
                    <Image
                      src={value.image}
                      alt=""
                      width={420}
                      height={350}
                      sizes="(min-width: 768px) 320px, 70vw"
                      className={`relative h-auto w-56 object-contain transition-transform duration-500 ease-out motion-reduce:transition-none md:w-72 ${value.tilt}`}
                    />
                  </div>
                  <div className="md:max-w-sm">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${value.pill}`}>
                      {value.stage}
                    </span>
                    <h3 className={`font-display mt-4 text-[clamp(1.875rem,3.4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.035em] ${value.ink}`}>
                      {value.title}
                    </h3>
                    <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">{value.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x section-tight border-t border-rule">
        <Reveal className="bg-[var(--ink)] rounded-3xl overflow-hidden grid md:grid-cols-2 items-center">
          <div className="p-8 sm:p-12">
            <span className="kicker text-terracotta-light">One firing a fortnight</span>
            <h2 className="display-2 mt-2 text-paper">Get a text when the kiln opens</h2>
            <p className="mt-2.5 mb-6 text-[0.95rem] leading-relaxed text-paper/70 max-w-md">
              No spam, no weekly newsletter - just a heads up when a fresh batch
              is ready to buy, before it sells out.
            </p>
            <KilnNotify />
          </div>
          <div className="p-8 sm:p-10 flex items-center justify-center md:self-stretch">
            <div className="relative w-full max-w-[260px] aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/newsletter.png"
                alt=""
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>

      <InstagramFeed posts={instagramPosts} />
    </>
  );
}
