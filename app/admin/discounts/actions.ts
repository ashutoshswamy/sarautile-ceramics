"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

async function insertDiscountCode(
  formData: FormData,
  firstPurchaseOnly: boolean,
  log: (action: string) => Promise<void>
) {
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

  await log(`Added discount code "${code}" (${percentOff}% off${firstPurchaseOnly ? ", first purchase only" : ""})`);
  revalidatePath("/admin/discounts");
  redirectWithToast("/admin/discounts", `"${code}" added.`);
}

export async function createDiscountCode(formData: FormData) {
  const { log } = await requireSection("discounts");
  await insertDiscountCode(formData, false, log);
}

export async function createFirstPurchaseDiscountCode(formData: FormData) {
  const { log } = await requireSection("discounts");
  await insertDiscountCode(formData, true, log);
}

export async function toggleDiscountCode(code: string, active: boolean) {
  const { log } = await requireSection("discounts");
  const { error } = await getSupabaseAdmin()
    .from("discount_codes")
    .update({ active })
    .eq("code", code);
  if (error) redirectWithToast("/admin/discounts", error.message, "error");

  await log(`${active ? "Enabled" : "Disabled"} discount code "${code}"`);
  revalidatePath("/admin/discounts");
  redirectWithToast("/admin/discounts", active ? `"${code}" enabled.` : `"${code}" disabled.`);
}

export async function deleteDiscountCode(code: string) {
  const { log } = await requireSection("discounts");
  const { error } = await getSupabaseAdmin().from("discount_codes").delete().eq("code", code);
  if (error) redirectWithToast("/admin/discounts", error.message, "error");

  await log(`Deleted discount code "${code}"`);
  revalidatePath("/admin/discounts");
  redirectWithToast("/admin/discounts", "Code deleted.");
}
