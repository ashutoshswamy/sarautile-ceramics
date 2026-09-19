"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";
import { redirectWithToast } from "@/lib/actionRedirect";

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirectWithToast("/admin/categories", "Enter a category name.", "error");

  const { error } = await getSupabaseAdmin()
    .from("categories")
    .insert({ slug: slugify(name), name });
  if (error) {
    redirectWithToast(
      "/admin/categories",
      error.code === "23505" ? `"${name}" already exists.` : error.message,
      "error"
    );
  }

  revalidateCategories();
  redirectWithToast("/admin/categories", `"${name}" added.`);
}

export async function deleteCategory(slug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("categories").delete().eq("slug", slug);
  if (error) redirectWithToast("/admin/categories", error.message, "error");

  revalidateCategories();
  redirectWithToast("/admin/categories", "Category deleted.");
}
