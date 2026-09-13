"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";

function revalidateStorefront(slug: string) {
  revalidatePath("/admin/mugs");
  revalidatePath(`/admin/mugs/${slug}`);
  revalidatePath("/mugs");
  revalidatePath(`/mugs/${slug}`);
  revalidatePath("/");
}

export async function updateMug(slug: string, formData: FormData) {
  await requireAdmin(); // re-checked here - never trust that the page render alone guarded this
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("mugs")
    .update({
      name: formData.get("name"),
      price: Number(formData.get("price")),
      oz: Number(formData.get("oz")),
      note: formData.get("note"),
      left_count: Number(formData.get("left_count")),
      photo_label: formData.get("photo_label"),
      category_slug: formData.get("category_slug") || null,
    })
    .eq("slug", slug);
  if (error) throw new Error(error.message);

  // Collections membership: replace wholesale rather than diff - simplest
  // correct thing for a handful of checkboxes.
  const collectionSlugs = formData.getAll("collections").map(String);
  const { error: delErr } = await supabase
    .from("mug_collections")
    .delete()
    .eq("mug_slug", slug);
  if (delErr) throw new Error(delErr.message);
  if (collectionSlugs.length > 0) {
    const { error: insErr } = await supabase
      .from("mug_collections")
      .insert(collectionSlugs.map((collection_slug) => ({ mug_slug: slug, collection_slug })));
    if (insErr) throw new Error(insErr.message);
  }

  revalidateStorefront(slug);
}

export async function createMug(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(name);

  const { error } = await getSupabaseAdmin().from("mugs").insert({
    slug,
    name: formData.get("name"),
    price: Number(formData.get("price")),
    oz: Number(formData.get("oz")),
    note: formData.get("note"),
    left_count: Number(formData.get("left_count")),
    photo_label: formData.get("photo_label"),
    category_slug: formData.get("category_slug") || null,
  });
  if (error) {
    throw new Error(
      error.code === "23505" ? `A mug with slug "${slug}" already exists.` : error.message
    );
  }

  revalidatePath("/admin/mugs");
  revalidatePath("/mugs");
  revalidatePath("/");
  redirect(`/admin/mugs/${slug}`);
}

export async function deleteMug(slug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("mugs").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidateStorefront(slug);
  redirect("/admin/mugs");
}

export async function addGlaze(mugSlug: string, formData: FormData) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("glazes").insert({
    mug_slug: mugSlug,
    name: formData.get("name"),
    hex: formData.get("hex"),
    description: formData.get("description"),
    shot: formData.get("shot"),
  });
  if (error) {
    throw new Error(
      error.code === "23505" ? "This mug already has a glaze by that name." : error.message
    );
  }
  revalidateStorefront(mugSlug);
}

export async function deleteGlaze(mugSlug: string, glazeName: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("glazes")
    .delete()
    .eq("mug_slug", mugSlug)
    .eq("name", glazeName);
  if (error) throw new Error(error.message);
  revalidateStorefront(mugSlug);
}
