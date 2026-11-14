import { notFound } from "next/navigation";
import { Amphora } from "lucide-react";
import ProductGridCard from "@/components/ProductGridCard";
import { getCollection, getCollectionMeta } from "@/lib/queries";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const [collection, products] = await Promise.all([getCollectionMeta(slug), getCollection(slug)]);
  if (!collection) return { title: "Collection - Sara Utile Ceramics", robots: { index: false } };
  const names = products.slice(0, 3).map((p) => p.name).join(", ");
  return {
    title: `${collection.name} - handmade ceramics collection | Sara Utile Ceramics`,
    description: `Shop the ${collection.name} collection - ${products.length} handmade wheel-thrown stoneware ${
      products.length === 1 ? "piece" : "pieces"
    }${names ? `, including ${names}` : ""}. Made in small batches by Sara Utile Ceramics, India.`.slice(0, 200),
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: `${collection.name} - Sara Utile Ceramics`,
      url: `/collections/${slug}`,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const [collection, products] = await Promise.all([getCollectionMeta(slug), getCollection(slug)]);
  if (!collection) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: collection.name,
      url: `${SITE_URL}/collections/${slug}`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/products/${p.slug}`,
          name: p.name,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: collection.name, item: `${SITE_URL}/collections/${slug}` },
      ],
    },
  ];

  return (
    <div className="container-x section-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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
