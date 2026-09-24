import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductDetail from "@/components/ProductDetail";
import ProductRow from "@/components/ProductRow";
import ProductReviews from "@/components/ProductReviews";
import { getProduct, getProducts, getReviews } from "@/lib/queries";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found", robots: { index: false } };
  const description =
    product.description?.slice(0, 160) ??
    `${product.name} - handmade wheel-thrown stoneware by Sara Utile Ceramics. ₹${product.price}.`;
  const image = product.images[0] ?? product.imageUrl ?? "/og-image.png";
  return {
    title: `${product.name} - Sara Utile Ceramics`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description, url: `/products/${product.slug}`, images: [image] },
    twitter: { title: product.name, description, images: [image] },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const [product, allProducts, reviews] = await Promise.all([
    getProduct(slug),
    getProducts(),
    getReviews(slug),
  ]);
  if (!product) notFound();

  const alsoBought = allProducts.filter((p) => p.slug !== product.slug).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : undefined,
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      price: product.price,
      priceCurrency: "INR",
      availability: product.left.startsWith("0 ")
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    aggregateRating: reviews.length
      ? {
          "@type": "AggregateRating",
          ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
          reviewCount: reviews.length,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" escaped so product text can't close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="container-x">
        <nav className="flex items-center gap-1 py-5 text-xs text-ink-faint">
          <Link href="/products" className="text-ink-faint no-underline hover:text-ink">
            Shop
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
          <span className="text-ink-soft">{product.name}</span>
        </nav>

        <div className="pb-14">
          <ProductDetail product={product} />
          <ProductReviews productSlug={product.slug} initialReviews={reviews} />
        </div>
      </div>

      <ProductRow title="People also bought" badge="Popular" products={alsoBought} />
    </>
  );
}
