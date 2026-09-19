"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function insertDiscountCode(formData: FormData, firstPurchaseOnly: boolean) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percentOff = Math.trunc(Number(formData.get("percentOff")));
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  if (!code || percentOff < 1 || percentOff > 100) return;

  const { error } = await getSupabaseAdmin().from("discount_codes").insert({
    code,
    percent_off: percentOff,
    expires_at: expiresAt || null,
    first_purchase_only: firstPurchaseOnly,
  });
  if (error) {
    throw new Error(error.code === "23505" ? `"${code}" already exists.` : error.message);
  }

  revalidatePath("/admin/discounts");
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
  if (error) throw new Error(error.message);

  revalidatePath("/admin/discounts");
}

export async function deleteDiscountCode(code: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("discount_codes").delete().eq("code", code);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/discounts");
}
