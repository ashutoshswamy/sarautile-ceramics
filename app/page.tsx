import Link from "next/link";
import { ArrowRight, Palette, Flame, Hand } from "lucide-react";
import MugCard from "@/components/MugCard";
import Hero from "@/components/Hero";
import { featuredMugs } from "@/lib/data";

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

export default function Home() {
  return (
    <>
      <Hero />

      <section className="container-x section-tight rise">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-8">
          <h2 className="display-2">Out of kiln 41</h2>
          <span className="text-sm text-ink-faint">
            Twelve mugs. When they&apos;re gone they&apos;re gone.
          </span>
          <Link href="/mugs" className="link-arrow ml-auto">
            All mugs <ArrowRight size={16} strokeWidth={1.7} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-9">
          {featuredMugs.map((mug) => (
            <MugCard key={mug.slug} mug={mug} />
          ))}
        </div>
      </section>

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
    </>
  );
}
