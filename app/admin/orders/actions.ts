"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export async function updateOrderStatus(id: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    redirectWithToast(`/admin/orders/${id}`, "Pick a valid status.", "error");
  }

  const { error } = await getSupabaseAdmin().from("orders").update({ status }).eq("id", id);
  if (error) redirectWithToast(`/admin/orders/${id}`, error.message, "error");

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirectWithToast(`/admin/orders/${id}`, "Order status updated.");
}
