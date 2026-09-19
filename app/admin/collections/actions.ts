"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";
import { redirectWithToast } from "@/lib/actionRedirect";

function revalidateCollections() {
  revalidatePath("/admin/collections");
  revalidatePath("/");
}

export async function createCollection(formData: FormData) {
  await requireAdmin();
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

  revalidateCollections();
  redirectWithToast("/admin/collections", `"${name}" added.`);
}

export async function deleteCollection(slug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("collections").delete().eq("slug", slug);
  if (error) redirectWithToast("/admin/collections", error.message, "error");

  revalidateCollections();
  redirectWithToast("/admin/collections", "Collection deleted.");
}
