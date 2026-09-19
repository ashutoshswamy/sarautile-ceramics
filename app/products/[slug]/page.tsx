import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductDetail from "@/components/ProductDetail";
import ProductRow from "@/components/ProductRow";
import ProductReviews from "@/components/ProductReviews";
import { getProduct, getProducts, getReviews } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  return { title: product ? `${product.name} - Sara Utile Ceramics` : "Not found" };
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

  return (
    <>
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
