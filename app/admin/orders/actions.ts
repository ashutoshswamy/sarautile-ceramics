"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast, errorMessage } from "@/lib/actionRedirect";
import { cancelOrder } from "@/lib/orderCancel";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export async function updateOrderStatus(id: number, formData: FormData) {
  const { log } = await requireSection("orders");
  const status = String(formData.get("status") ?? "");
  // "cancelled" only via cancelOrder below - it also refunds and restocks.
  if (status === "cancelled" || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    redirectWithToast(`/admin/orders/${id}`, "Pick a valid status.", "error");
  }

  const { error } = await getSupabaseAdmin().from("orders").update({ status }).eq("id", id);
  if (error) redirectWithToast(`/admin/orders/${id}`, error.message, "error");

  await log(`Set order #${id} to ${status}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirectWithToast(`/admin/orders/${id}`, "Order status updated.");
}

export async function cancelOrderAction(id: number) {
  const { log } = await requireSection("orders");
  try {
    await cancelOrder(id);
  } catch (err) {
    redirectWithToast(`/admin/orders/${id}`, errorMessage(err), "error");
  }
  await log(`Cancelled order #${id} and refunded it`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirectWithToast(`/admin/orders/${id}`, "Order cancelled and refunded.");
}

// After the Shiprocket CSV is uploaded: tick the orders, mark them shipped.
export async function markShipped(formData: FormData) {
  const { log } = await requireSection("orders");
  const ids = formData.getAll("id").map(Number).filter(Number.isInteger);
  if (ids.length === 0) redirectWithToast("/admin/orders", "Tick the orders to mark as shipped.", "error");

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .update({ status: "shipped" })
    .in("id", ids)
    .in("status", ["pending", "processing"])
    .select("id");
  if (error) redirectWithToast("/admin/orders", error.message, "error");

  await log(`Marked ${data?.length ?? 0} order(s) shipped: ${ids.join(", ")}`);
  revalidatePath("/admin/orders");
  redirectWithToast("/admin/orders", `${data?.length ?? 0} order(s) moved to shipped.`);
}
