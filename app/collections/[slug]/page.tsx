import { notFound } from "next/navigation";
import { Amphora } from "lucide-react";
import ProductGridCard from "@/components/ProductGridCard";
import { getCollection, getCollectionMeta } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const collection = await getCollectionMeta(slug);
  return {
    title: collection
      ? `${collection.name} - Sara Utile Ceramics`
      : "Collection - Sara Utile Ceramics",
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const [collection, products] = await Promise.all([getCollectionMeta(slug), getCollection(slug)]);
  if (!collection) notFound();

  return (
    <div className="container-x section-tight">
      <h1 className="display-2">{collection.name}</h1>
      <p className="lede text-[0.95rem] mt-3">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
      </p>

      {products.length === 0 ? (
        <div className="card p-8 mt-8 flex flex-col items-start gap-3">
          <Amphora size={22} strokeWidth={1.6} className="text-terracotta" />
          <p className="lede text-[0.95rem]">Nothing in this collection yet.</p>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {products.map((product) => (
            <ProductGridCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
