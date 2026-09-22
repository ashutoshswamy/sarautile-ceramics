import { unstable_cache } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import type { Product } from "@/lib/data";

// ponytail: every query below was hitting Supabase fresh on every nav (no
// caching layer at all) - that's the site-wide navigation lag. 60s
// time-based revalidate via Next's built-in data cache fixes it with zero
// new deps. Upgrade path if admin edits need to show instantly: tag these
// ("catalog") and call revalidateTag("catalog") from the admin mutations.
const CACHE_OPTS = { revalidate: 60 };

type ProductRow = {
  slug: string;
  name: string;
  price: number;
  weight: string | null;
  left_count: number;
  photo_label: string;
  image_url: string | null;
  category_slug: string | null;
  description: string | null;
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
    description: p.description,
  }));
}

// Catalog starts empty - every function here can legitimately return [] /
// undefined, and every caller needs to handle that (hide the section, show
// an empty state) rather than assume seed data exists.
export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
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
  },
  ["products"],
  CACHE_OPTS
);

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

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
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
  },
  ["site-settings"],
  CACHE_OPTS
);

export type Category = { slug: string; name: string };

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await getSupabase()
      .from("categories")
      .select("slug, name")
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
  ["categories"],
  CACHE_OPTS
);

/** Categories that actually have at least one product, each with its products. */
export async function getCategoriesWithProducts(): Promise<
  { slug: string; name: string; products: Product[] }[]
> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return categories
    .map((c) => ({ ...c, products: products.filter((p) => p.categorySlug === c.slug) }))
    .filter((c) => c.products.length > 0);
}

export const getCollection = unstable_cache(
  async (slug: string): Promise<Product[]> => {
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
  },
  ["collection"],
  CACHE_OPTS
);

export const getCollectionMeta = unstable_cache(
  async (slug: string): Promise<{ slug: string; name: string } | undefined> => {
    const { data, error } = await getSupabase()
      .from("collections")
      .select("slug, name")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ?? undefined;
  },
  ["collection-meta"],
  CACHE_OPTS
);

// "new-arrivals"/"bestsellers" already get their own homepage rows (see
// app/page.tsx) - excluded here so they don't also show up as tiles in
// "Shop by collection".
const FEATURED_COLLECTION_SLUGS = new Set(["new-arrivals", "bestsellers"]);

/** Collections (excluding the featured homepage rows) that have at least one product. */
export const getCollectionsWithProducts = unstable_cache(
  async (): Promise<{ slug: string; name: string; products: Product[] }[]> => {
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
  },
  ["collections-with-products"],
  CACHE_OPTS
);

export type Review = {
  id: number;
  rating: number;
  comment: string;
  customerName: string;
  avatarUrl: string | null;
  adminReply: string | null;
};

/** Approved reviews for one product, newest first. */
export const getReviews = unstable_cache(
  async (productSlug: string): Promise<Review[]> => {
    const { data, error } = await getSupabase()
      .from("reviews")
      .select("id, rating, comment, customer_name, avatar_url, admin_reply")
      .eq("product_slug", productSlug)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      customerName: r.customer_name,
      avatarUrl: r.avatar_url,
      adminReply: r.admin_reply,
    }));
  },
  ["reviews"],
  CACHE_OPTS
);

export type InstagramPost = { id: number; url: string };

/** Latest Instagram posts, newest first - managed from /admin/instagram. */
export const getInstagramPosts = unstable_cache(
  async (): Promise<InstagramPost[]> => {
    const { data, error } = await getSupabase()
      .from("instagram_posts")
      .select("id, url")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  ["instagram-posts"],
  CACHE_OPTS
);
