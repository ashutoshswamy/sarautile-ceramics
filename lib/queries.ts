import { getSupabase } from "@/lib/supabase";
import type { Product } from "@/lib/data";

type ProductRow = {
  slug: string;
  name: string;
  price: number;
  weight: string | null;
  left_count: number;
  photo_label: string;
  image_url: string | null;
  category_slug: string | null;
};

type ProductImageRow = {
  product_slug: string;
  url: string;
  position: number;
};

function assemble(productRows: ProductRow[], imageRows: ProductImageRow[]): Product[] {
  return productRows.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    weight: p.weight,
    left: `${p.left_count} left`,
    photoLabel: p.photo_label,
    imageUrl: p.image_url,
    images: imageRows
      .filter((i) => i.product_slug === p.slug)
      .sort((a, b) => a.position - b.position)
      .map((i) => i.url),
    categorySlug: p.category_slug,
  }));
}

// Catalog starts empty - every function here can legitimately return [] /
// undefined, and every caller needs to handle that (hide the section, show
// an empty state) rather than assume seed data exists.
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  const [
    { data: productRows, error: productErr },
    { data: imageRows, error: imageErr },
  ] = await Promise.all([
    supabase.from("products").select("*").order("created_at"),
    supabase.from("product_images").select("*").order("position"),
  ]);
  if (productErr) throw productErr;
  if (imageErr) throw imageErr;
  return assemble(productRows ?? [], imageRows ?? []);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export type SiteSettings = {
  heroImageMobile: string | null;
  heroImageTablet: string | null;
  heroImageDesktop: string | null;
  heroImageMobilePosition: string;
  heroImageTabletPosition: string;
  heroImageDesktopPosition: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await getSupabase()
    .from("site_settings")
    .select(
      "hero_image_mobile, hero_image_tablet, hero_image_desktop, hero_image_mobile_position, hero_image_tablet_position, hero_image_desktop_position"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return {
    heroImageMobile: data?.hero_image_mobile ?? null,
    heroImageTablet: data?.hero_image_tablet ?? null,
    heroImageDesktop: data?.hero_image_desktop ?? null,
    heroImageMobilePosition: data?.hero_image_mobile_position ?? "50% 50%",
    heroImageTabletPosition: data?.hero_image_tablet_position ?? "50% 50%",
    heroImageDesktopPosition: data?.hero_image_desktop_position ?? "50% 50%",
  };
}

export type Category = { slug: string; name: string };

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("slug, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

/** Categories that actually have at least one product, each with its products. */
export async function getCategoriesWithProducts(): Promise<
  { slug: string; name: string; products: Product[] }[]
> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return categories
    .map((c) => ({ ...c, products: products.filter((p) => p.categorySlug === c.slug) }))
    .filter((c) => c.products.length > 0);
}

export async function getCollection(slug: string): Promise<Product[]> {
  const supabase = getSupabase();
  const [{ data: links, error }, products] = await Promise.all([
    supabase
      .from("product_collections")
      .select("product_slug")
      .eq("collection_slug", slug)
      .order("created_at"),
    getProducts(),
  ]);
  if (error) throw error;
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return (links ?? [])
    .map((l) => bySlug.get(l.product_slug))
    .filter((p): p is Product => !!p);
}

export async function getCollectionMeta(
  slug: string
): Promise<{ slug: string; name: string } | undefined> {
  const { data, error } = await getSupabase()
    .from("collections")
    .select("slug, name")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

// "new-arrivals"/"bestsellers" already get their own homepage rows (see
// app/page.tsx) - excluded here so they don't also show up as tiles in
// "Shop by collection".
const FEATURED_COLLECTION_SLUGS = new Set(["new-arrivals", "bestsellers"]);

/** Collections (excluding the featured homepage rows) that have at least one product. */
export async function getCollectionsWithProducts(): Promise<
  { slug: string; name: string; products: Product[] }[]
> {
  const supabase = getSupabase();
  const [{ data: collections, error: colErr }, { data: links, error: linkErr }, products] =
    await Promise.all([
      supabase.from("collections").select("slug, name").order("name"),
      supabase.from("product_collections").select("product_slug, collection_slug"),
      getProducts(),
    ]);
  if (colErr) throw colErr;
  if (linkErr) throw linkErr;
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return (collections ?? [])
    .filter((c) => !FEATURED_COLLECTION_SLUGS.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      products: (links ?? [])
        .filter((l) => l.collection_slug === c.slug)
        .map((l) => bySlug.get(l.product_slug))
        .filter((p): p is Product => !!p),
    }))
    .filter((c) => c.products.length > 0);
}

export type Review = {
  id: number;
  rating: number;
  comment: string;
  customerName: string;
};

/** Approved reviews for one product, newest first. */
export async function getReviews(productSlug: string): Promise<Review[]> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .select("id, rating, comment, customer_name")
    .eq("product_slug", productSlug)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    customerName: r.customer_name,
  }));
}
