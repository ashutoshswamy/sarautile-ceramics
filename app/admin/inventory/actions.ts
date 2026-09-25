"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

export async function updateStock(formData: FormData) {
  const { log, label } = await requireSection("inventory");
  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase
    .from("products")
    .select("slug, name, left_count")
    .returns<{ slug: string; name: string; left_count: number }[]>();
  const bySlug = new Map((current ?? []).map((p) => [p.slug, p]));

  // Only write rows that actually changed - keeps the history and log honest.
  const updates = Array.from(formData.entries())
    .filter((entry): entry is [string, string] => entry[0].startsWith("stock_"))
    .map(([key, value]) => ({
      slug: key.slice("stock_".length),
      left_count: Math.max(0, Math.trunc(Number(value)) || 0),
    }))
    .filter((u) => bySlug.has(u.slug) && bySlug.get(u.slug)!.left_count !== u.left_count);

  if (updates.length === 0) redirectWithToast("/admin/inventory", "No stock changes to save.");

  // stock_updated_by is read (and cleared) by the inventory_history trigger.
  const results = await Promise.all(
    updates.map(({ slug, left_count }) =>
      supabase.from("products").update({ left_count, stock_updated_by: label }).eq("slug", slug)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) redirectWithToast("/admin/inventory", failed.error.message, "error");

  await log(
    "Updated stock: " +
      updates
        .map((u) => `${bySlug.get(u.slug)!.name} ${bySlug.get(u.slug)!.left_count} → ${u.left_count}`)
        .join(", ")
  );
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/analytics");
  revalidatePath("/products");
  revalidatePath("/");
  redirectWithToast("/admin/inventory", "Stock updated.");
}
