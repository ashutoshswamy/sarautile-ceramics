"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const updates = Array.from(formData.entries())
    .filter((entry): entry is [string, string] => entry[0].startsWith("stock_"))
    .map(([key, value]) => ({
      slug: key.slice("stock_".length),
      left_count: Math.max(0, Math.trunc(Number(value)) || 0),
    }));

  const results = await Promise.all(
    updates.map(({ slug, left_count }) =>
      supabase.from("products").update({ left_count }).eq("slug", slug)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) redirectWithToast("/admin/inventory", failed.error.message, "error");

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/analytics");
  revalidatePath("/products");
  revalidatePath("/");
  redirectWithToast("/admin/inventory", "Stock updated.");
}
