import type { MetadataRoute } from "next";
import { getCollectionsWithProducts, getProducts } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

// Rebuilt hourly so new products/collections show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getProducts().catch(() => []),
    getCollectionsWithProducts().catch(() => []),
  ]);
  const page = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, priority });
  return [
    page("", 1),
    page("/products", 0.9),
    page("/story", 0.6),
    page("/care", 0.5),
    page("/wholesale", 0.6),
    ...products.map((p) => page(`/products/${p.slug}`, 0.8)),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.7)),
  ];
}
