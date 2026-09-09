import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import ProductDetail from "@/components/ProductDetail";
import { findMug, mugs } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return mugs.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(
  props: PageProps<"/mugs/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const mug = findMug(slug);
  return { title: mug ? `${mug.name} - Sarautile Ceramics` : "Mug not found" };
}

export default async function MugPage(props: PageProps<"/mugs/[slug]">) {
  const { slug } = await props.params;
  const mug = findMug(slug);
  if (!mug) notFound();

  return (
    <>
      <div className="container-x">
        <nav className="flex items-center gap-1 py-5 text-xs text-ink-faint">
          <Link href="/mugs" className="text-ink-faint no-underline hover:text-ink">
            Mugs
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
          <span className="text-ink-soft">{mug.name}</span>
        </nav>

        <div className="pb-14">
          <ProductDetail mug={mug} />
        </div>
      </div>

      <div className="bg-sand border-y border-rule">
        <div className="container-x section grid gap-10 md:grid-cols-[.85fr_1.15fr] md:items-center rise">
          <PlaceholderPhoto
            label="portrait - Meera at the wheel"
            rounded="rounded-[28px]"
            className="aspect-[4/3] p-3.5"
          />
          <div>
            <span className="kicker">Who made this</span>
            <h2 className="display-2 mt-3">
              Meera throws in the mornings, Arjun glazes after lunch
            </h2>
            <p className="lede text-[0.95rem] mt-4 max-w-[46ch]">
              We took over an old godown in India in 2019 with one secondhand
              wheel and a kiln that trips the electrics if you run the kettle.
              Meera&apos;s been throwing for eleven years; this mug is the
              shape she&apos;d been trying to get right for about nine of them.
              Arjun mixes every glaze from raw materials, which is why Ember is
              slightly different every batch - and why we photograph the
              actual mug you&apos;ll get.
            </p>
            <Link href="/story" className="link-arrow mt-5">
              Read the whole story <ArrowRight size={16} strokeWidth={1.7} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
