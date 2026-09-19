"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

async function insertDiscountCode(formData: FormData, firstPurchaseOnly: boolean) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percentOff = Math.trunc(Number(formData.get("percentOff")));
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  if (!code || percentOff < 1 || percentOff > 100) {
    redirectWithToast("/admin/discounts", "Enter a code and a % off between 1 and 100.", "error");
  }

  const { error } = await getSupabaseAdmin().from("discount_codes").insert({
    code,
    percent_off: percentOff,
    expires_at: expiresAt || null,
    first_purchase_only: firstPurchaseOnly,
  });
  if (error) {
    redirectWithToast(
      "/admin/discounts",
      error.code === "23505" ? `"${code}" already exists.` : error.message,
      "error"
    );
  }

  revalidatePath("/admin/discounts");
  redirectWithToast("/admin/discounts", `"${code}" added.`);
}

export async function createDiscountCode(formData: FormData) {
  await requireAdmin();
  await insertDiscountCode(formData, false);
}

export async function createFirstPurchaseDiscountCode(formData: FormData) {
  await requireAdmin();
  await insertDiscountCode(formData, true);
}

export async function toggleDiscountCode(code: string, active: boolean) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("discount_codes")
    .update({ active })
    .eq("code", code);
  if (error) redirectWithToast("/admin/discounts", error.message, "error");

  revalidatePath("/admin/discounts");
  redirectWithToast("/admin/discounts", active ? `"${code}" enabled.` : `"${code}" disabled.`);
}

export async function deleteDiscountCode(code: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("discount_codes").delete().eq("code", code);
  if (error) redirectWithToast("/admin/discounts", error.message, "error");

  revalidatePath("/admin/discounts");
  redirectWithToast("/admin/discounts", "Code deleted.");
}
