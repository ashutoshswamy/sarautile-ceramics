"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { error } = await getSupabaseAdmin()
    .from("categories")
    .insert({ slug: slugify(name), name });
  if (error) {
    throw new Error(
      error.code === "23505" ? `"${name}" already exists.` : error.message
    );
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/mugs");
}

export async function deleteCategory(slug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("categories").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/mugs");
}
