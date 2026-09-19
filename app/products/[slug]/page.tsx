import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductDetail from "@/components/ProductDetail";
import ProductRow from "@/components/ProductRow";
import { getMug, getMugs } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const mugs = await getMugs();
  return mugs.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(
  props: PageProps<"/mugs/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const mug = await getMug(slug);
  return { title: mug ? `${mug.name} - Sarautile Ceramics` : "Mug not found" };
}

export default async function MugPage(props: PageProps<"/mugs/[slug]">) {
  const { slug } = await props.params;
  const [mug, allMugs] = await Promise.all([getMug(slug), getMugs()]);
  if (!mug) notFound();

  const alsoBought = allMugs.filter((m) => m.slug !== mug.slug).slice(0, 4);

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

      <ProductRow title="People also bought" badge="Popular" mugs={alsoBought} />
    </>
  );
}
