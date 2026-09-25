"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";
import { redirectWithToast } from "@/lib/actionRedirect";

function revalidateCollections() {
  revalidatePath("/admin/collections");
  revalidatePath("/");
}

export async function createCollection(formData: FormData) {
  const { log } = await requireSection("collections");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirectWithToast("/admin/collections", "Enter a collection name.", "error");

  const { error } = await getSupabaseAdmin()
    .from("collections")
    .insert({ slug: slugify(name), name });
  if (error) {
    redirectWithToast(
      "/admin/collections",
      error.code === "23505" ? `"${name}" already exists.` : error.message,
      "error"
    );
  }

  await log(`Added collection "${name}"`);
  revalidateCollections();
  redirectWithToast("/admin/collections", `"${name}" added.`);
}

export async function deleteCollection(slug: string) {
  const { log } = await requireSection("collections");
  const { error } = await getSupabaseAdmin().from("collections").delete().eq("slug", slug);
  if (error) redirectWithToast("/admin/collections", error.message, "error");

  await log(`Deleted collection "${slug}"`);
  revalidateCollections();
  redirectWithToast("/admin/collections", "Collection deleted.");
}
