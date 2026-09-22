"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

export async function approveReview(id: number, productSlug: string, returnPath: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("reviews")
    .update({ approved: true })
    .eq("id", id);
  if (error) redirectWithToast(returnPath, error.message, "error");

  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${productSlug}`);
  redirectWithToast(returnPath, "Review approved.");
}

export async function deleteReview(id: number, productSlug: string, returnPath: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("reviews").delete().eq("id", id);
  if (error) redirectWithToast(returnPath, error.message, "error");

  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${productSlug}`);
  redirectWithToast(returnPath, "Review deleted.");
}

export async function replyToReview(
  id: number,
  productSlug: string,
  returnPath: string,
  formData: FormData
) {
  await requireAdmin();
  const reply = String(formData.get("reply") ?? "").trim();
  const { error } = await getSupabaseAdmin()
    .from("reviews")
    .update({ admin_reply: reply || null, admin_reply_at: reply ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) redirectWithToast(returnPath, error.message, "error");

  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${productSlug}`);
  redirectWithToast(returnPath, reply ? "Reply posted." : "Reply removed.");
}
