"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function approveReview(id: number, productSlug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("reviews")
    .update({ approved: true })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${productSlug}`);
}

export async function deleteReview(id: number, productSlug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${productSlug}`);
}
