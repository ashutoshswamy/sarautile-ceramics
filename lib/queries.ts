import { getSupabase } from "@/lib/supabase";
import type { Mug, Glaze } from "@/lib/data";

type MugRow = {
  slug: string;
  name: string;
  price: number;
  oz: number;
  note: string;
  left_count: number;
  photo_label: string;
  category_slug: string | null;
};

type GlazeRow = {
  mug_slug: string;
  name: string;
  hex: string;
  description: string;
  shot: string;
};

function assemble(mugRows: MugRow[], glazeRows: GlazeRow[]): Mug[] {
  return mugRows.map((m) => ({
    slug: m.slug,
    name: m.name,
    price: m.price,
    oz: m.oz,
    note: m.note,
    left: `${m.left_count} left`,
    photoLabel: m.photo_label,
    categorySlug: m.category_slug,
    glazes: glazeRows
      .filter((g) => g.mug_slug === m.slug)
      .map((g): Glaze => ({ name: g.name, hex: g.hex, desc: g.description, shot: g.shot })),
  }));
}

// Catalog starts empty - every function here can legitimately return [] /
// undefined, and every caller needs to handle that (hide the section, show
// an empty state) rather than assume seed data exists.
export async function getMugs(): Promise<Mug[]> {
  const supabase = getSupabase();
  const [{ data: mugRows, error: mugErr }, { data: glazeRows, error: glazeErr }] =
    await Promise.all([
      supabase.from("mugs").select("*").order("created_at"),
      supabase.from("glazes").select("*").order("id"),
    ]);
  if (mugErr) throw mugErr;
  if (glazeErr) throw glazeErr;
  return assemble(mugRows ?? [], glazeRows ?? []);
}

export async function getMug(slug: string): Promise<Mug | undefined> {
  return (await getMugs()).find((m) => m.slug === slug);
}

export type SiteSettings = {
  heroImageMobile: string | null;
  heroImageTablet: string | null;
  heroImageDesktop: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await getSupabase()
    .from("site_settings")
    .select("hero_image_mobile, hero_image_tablet, hero_image_desktop")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return {
    heroImageMobile: data?.hero_image_mobile ?? null,
    heroImageTablet: data?.hero_image_tablet ?? null,
    heroImageDesktop: data?.hero_image_desktop ?? null,
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

/** Categories that actually have at least one mug, each with its mugs. */
export async function getCategoriesWithMugs(): Promise<
  { slug: string; name: string; mugs: Mug[] }[]
> {
  const [categories, mugs] = await Promise.all([getCategories(), getMugs()]);
  return categories
    .map((c) => ({ ...c, mugs: mugs.filter((m) => m.categorySlug === c.slug) }))
    .filter((c) => c.mugs.length > 0);
}

export async function getCollection(slug: string): Promise<Mug[]> {
  const supabase = getSupabase();
  const [{ data: links, error }, mugs] = await Promise.all([
    supabase
      .from("mug_collections")
      .select("mug_slug")
      .eq("collection_slug", slug)
      .order("created_at"),
    getMugs(),
  ]);
  if (error) throw error;
  const bySlug = new Map(mugs.map((m) => [m.slug, m]));
  return (links ?? [])
    .map((l) => bySlug.get(l.mug_slug))
    .filter((m): m is Mug => !!m);
}

export async function getGlazeFilters() {
  const mugs = await getMugs();
  const byName = new Map<
    string,
    { name: string; hex: string; desc: string; count: number }
  >();
  for (const m of mugs) {
    for (const g of m.glazes) {
      const hit = byName.get(g.name);
      if (hit) hit.count++;
      else byName.set(g.name, { name: g.name, hex: g.hex, desc: g.desc, count: 1 });
    }
  }
  return [...byName.values()];
}
