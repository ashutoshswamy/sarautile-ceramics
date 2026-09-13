"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";

export async function createCollection(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { error } = await getSupabaseAdmin()
    .from("collections")
    .insert({ slug: slugify(name), name });
  if (error) {
    throw new Error(
      error.code === "23505" ? `"${name}" already exists.` : error.message
    );
  }

  revalidatePath("/admin/collections");
  revalidatePath("/");
}

export async function deleteCollection(slug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("collections").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/");
}
