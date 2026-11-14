import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { refundRazorpayPayment } from "@/lib/razorpay";

// Cancel an order that hasn't shipped: claim it (status -> cancelled, so two
// clicks can't refund twice), refund the full payment, then put the stock back.
// If the refund fails the claim is undone and the error is thrown, so an order
// is never cancelled without its money going back. Pass userId to restrict to
// that customer's own order.
export async function cancelOrder(id: number, userId?: string) {
  const supabase = getSupabaseAdmin();

  let find = supabase
    .from("orders")
    .select("status, total, razorpay_payment_id")
    .eq("id", id);
  if (userId) find = find.eq("user_id", userId);
  const { data: order } = await find.maybeSingle();
  if (!order) throw new Error("Order not found.");
  if (order.status !== "pending" && order.status !== "processing") {
    throw new Error(`A ${order.status} order can't be cancelled.`);
  }

  const { data: claimed } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", order.status)
    .select("id");
  if (!claimed?.length) throw new Error("This order just changed - refresh and try again.");

  let refundId: string;
  try {
    refundId = (await refundRazorpayPayment(order.razorpay_payment_id, Math.round(order.total * 100))).id;
  } catch (err) {
    await supabase.from("orders").update({ status: order.status }).eq("id", id).eq("status", "cancelled");
    throw new Error(`Refund failed, order not cancelled: ${err instanceof Error ? err.message : "unknown error"}`);
  }
  await supabase.from("orders").update({ refund_id: refundId }).eq("id", id);

  const { data: items } = await supabase
    .from("order_items")
    .select("product_slug, qty")
    .eq("order_id", id);
  await Promise.all(
    (items ?? []).map(async (i) => {
      const { error } = await supabase.rpc("increment_product_stock", { p_slug: i.product_slug, p_qty: i.qty });
      // Refund already went out; a restock hiccup shouldn't fail the cancel.
      if (error) console.error(`restock failed for ${i.product_slug}:`, error);
    })
  );
}
