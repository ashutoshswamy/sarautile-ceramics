import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/Hero";
import KilnNotify from "@/components/KilnNotify";
import ProductRow from "@/components/ProductRow";
import ShopByCategory from "@/components/ShopByCategory";
import ShopByCollection from "@/components/ShopByCollection";
import InstagramFeed from "@/components/InstagramFeed";
import Reveal from "@/components/Reveal";
import ValueCard from "@/components/ValueCard";
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

export const metadata: Metadata = { alternates: { canonical: "/" } };

const VALUES = [
  {
    image: "/step1.png",
    title: "We mix the glazes",
    body: "Five recipes, ground in a bucket out back. Ember is the one everyone comes for.",
    ink: "text-neutral-ink",
    tilt: "-rotate-3",
  },
  {
    image: "/step2.png",
    title: "One firing a fortnight",
    body: "The kiln takes what it takes. Sign up and we'll nudge you when the door opens.",
    ink: "text-gold-ink",
    tilt: "rotate-2",
  },
  {
    image: "/step3.png",
    title: "Made to be used",
    body: "Chip it, stain it, love it. And if it arrives broken we'll throw you another.",
    ink: "text-sage-ink",
    tilt: "-rotate-2",
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
          <div className="mb-10 max-w-xl">
            <span className="kicker">Behind the scenes</span>
            <h2 className="display-2 mt-2">How we work</h2>
            <p className="lede text-[0.95rem] mt-2.5">
              Same three steps, every single batch — mixed, fired, and sent off to get used.
            </p>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="hidden md:block absolute left-1/2 -translate-x-1/2 inset-y-0 -z-10 border-l-2 border-dashed border-rule-strong/50"
            />
            <div className="space-y-16 md:space-y-24">
              {VALUES.map((value, i) => {
                const reversed = i % 2 === 1;
                return (
                  <ValueCard key={value.title}>
                    <div className="relative grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                      <div className={`grid place-items-center ${reversed ? "md:order-2" : ""}`}>
                        <Image
                          src={value.image}
                          alt=""
                          width={420}
                          height={420}
                          className={`w-72 h-72 md:w-96 md:h-96 object-contain ${value.tilt}`}
                        />
                      </div>
                      <div className={reversed ? "md:order-1 md:text-right" : ""}>
                        <span
                          className={`block text-[0.6875rem] font-semibold tracking-[0.15em] uppercase ${value.ink}`}
                        >
                          Step 0{i + 1}
                        </span>
                        <h3 className="display-2 mt-2">{value.title}</h3>
                        <p className={`lede text-[0.95rem] mt-3 max-w-md ${reversed ? "md:ml-auto" : ""}`}>
                          {value.body}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className={`hidden md:grid absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 place-items-center w-11 h-11 rounded-full border border-rule bg-paper ring-8 ring-sand text-[0.75rem] font-semibold ${value.ink}`}
                      >
                        0{i + 1}
                      </span>
                    </div>
                  </ValueCard>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x section-tight">
        <Reveal className="bg-[var(--ink)] text-paper rounded-3xl p-8 sm:p-12 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
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
        </Reveal>
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
