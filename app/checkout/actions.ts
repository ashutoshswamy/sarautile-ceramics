"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createRazorpayOrder,
  fetchRazorpayOrder,
  verifyRazorpaySignature,
} from "@/lib/razorpay";

// Source of truth for what a cart actually costs - always re-derives prices
// from the products table and re-validates the discount code server-side.
// Never trust a price, subtotal, or total handed in by the client: both
// startPayment (what Razorpay charges) and placeOrder (what gets recorded)
// call this same function so they can't diverge or be tampered with.
async function hasOrdered(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string
) {
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}

async function priceCart(
  items: { slug: string; qty: number }[],
  discountCode: string | null,
  userId: string
) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("Your cart is empty.");
  if (items.length > 50) throw new Error("Too many items in one order.");
  const supabase = getSupabaseAdmin();

  const { data: products, error } = await supabase
    .from("products")
    .select("slug, price")
    .in(
      "slug",
      items.map((i) => i.slug)
    );
  if (error) throw new Error(error.message);
  const priceBySlug = new Map((products ?? []).map((p) => [p.slug, p.price]));

  const lines = items.map((item) => {
    const price = priceBySlug.get(item.slug);
    if (price == null) throw new Error(`"${item.slug}" is no longer available.`);
    const qty = Math.min(9, Math.max(1, Math.round(Number(item.qty)) || 1));
    return { slug: item.slug, qty, unitPrice: price, lineTotal: price * qty };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  let discountAmount = 0;
  let appliedCode: string | null = null;
  if (discountCode) {
    const { data } = await supabase
      .from("discount_codes")
      .select("code, percent_off, active, expires_at, first_purchase_only")
      .eq("code", discountCode.trim().toUpperCase())
      .maybeSingle();
    const notExpired = !(data?.expires_at && new Date(data.expires_at) < new Date());
    const eligible = !data?.first_purchase_only || !(await hasOrdered(supabase, userId));
    if (data?.active && notExpired && eligible) {
      discountAmount = Math.round((subtotal * data.percent_off) / 100);
      appliedCode = data.code;
    }
  }

  const total = subtotal - discountAmount;
  return { lines, subtotal, discountAmount, appliedCode, total };
}

export async function startPayment(input: {
  shipping: PlaceOrderInput["shipping"];
  items: { slug: string; qty: number }[];
  discountCode: string | null;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Sign in to check out.");
  // Reject bad shipping details before charging, not after.
  cleanShipping(input.shipping);

  const { total } = await priceCart(input.items, input.discountCode, user.id);
  // user_id in notes lets placeOrder confirm this payment belongs to the
  // same signed-in user - a paid order id can't be replayed by someone else.
  const order = await createRazorpayOrder(Math.round(total * 100), `rcpt_${Date.now()}`, {
    user_id: user.id,
  });
  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

export type PlaceOrderInput = {
  shipping: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pin: string;
  };
  items: { slug: string; qty: number }[];
  discountCode: string | null;
  razorpay: {
    orderId: string;
    paymentId: string;
    signature: string;
  };
};

export async function placeOrder(input: PlaceOrderInput) {
  const user = await currentUser();
  if (!user) throw new Error("Sign in to check out.");

  const verified = verifyRazorpaySignature(
    input.razorpay.orderId,
    input.razorpay.paymentId,
    input.razorpay.signature
  );
  if (!verified) throw new Error("Payment could not be verified.");

  const shipping = cleanShipping(input.shipping);

  const { lines, subtotal, discountAmount, appliedCode, total } = await priceCart(
    input.items,
    input.discountCode,
    user.id
  );

  // The signature only proves *some* payment for this Razorpay order went
  // through. Also check the order was created for this user and charged
  // exactly what this cart costs now - otherwise a cheap cart's payment
  // could be replayed to "buy" an expensive one.
  const rzpOrder = await fetchRazorpayOrder(input.razorpay.orderId);
  const notes = Array.isArray(rzpOrder.notes) ? {} : rzpOrder.notes;
  if (
    notes.user_id !== user.id ||
    rzpOrder.currency !== "INR" ||
    rzpOrder.amount !== Math.round(total * 100)
  ) {
    throw new Error("Payment could not be verified.");
  }

  const supabase = getSupabaseAdmin();
  const { count: existing } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("razorpay_order_id", input.razorpay.orderId);
  if (existing) throw new Error("This payment has already been used for an order.");

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      email: shipping.email,
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      pin: shipping.pin,
      subtotal,
      discount_code: appliedCode,
      discount_amount: discountAmount,
      total,
      razorpay_order_id: input.razorpay.orderId,
      razorpay_payment_id: input.razorpay.paymentId,
    })
    .select("id")
    .single();
  if (orderErr || !order) throw new Error("Couldn't place the order - try again in a moment.");

  const { error: itemsErr } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      user_id: user.id,
      product_slug: line.slug,
      qty: line.qty,
      unit_price: line.unitPrice,
    }))
  );
  if (itemsErr) throw new Error("Couldn't place the order - try again in a moment.");

  // Payment's already captured and the order's already recorded, so a stock
  // hiccup here shouldn't fail the checkout - just log it for admin to fix.
  await Promise.all(
    lines.map(async (line) => {
      const { error } = await supabase.rpc("decrement_product_stock", {
        p_slug: line.slug,
        p_qty: line.qty,
      });
      if (error) console.error(`stock decrement failed for ${line.slug}:`, error);
    })
  );

  return { orderId: order.id };
}

function cleanShipping(s: PlaceOrderInput["shipping"]) {
  const field = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const out = {
    email: field(s?.email, 254),
    firstName: field(s?.firstName, 100),
    lastName: field(s?.lastName, 100),
    address: field(s?.address, 500),
    city: field(s?.city, 100),
    state: field(s?.state, 100),
    pin: field(s?.pin, 10),
  };
  if (Object.values(out).some((v) => !v)) throw new Error("Fill in every shipping field.");
  if (!/^\S+@\S+\.\S+$/.test(out.email)) throw new Error("Enter a valid email.");
  if (!/^\d{6}$/.test(out.pin)) throw new Error("Enter a valid 6-digit PIN code.");
  return out;
}

export async function applyDiscountCode(rawCode: string, subtotal: number) {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Sign in to check out.", code: "", amount: 0 };

  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a code.", code: "", amount: 0 };

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("discount_codes")
    .select("code, percent_off, active, expires_at, first_purchase_only")
    .eq("code", code)
    .maybeSingle();

  if (!data || !data.active) {
    return { ok: false, message: "That code isn't valid.", code: "", amount: 0 };
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, message: "That code has expired.", code: "", amount: 0 };
  }
  if (data.first_purchase_only && (await hasOrdered(supabase, user.id))) {
    return {
      ok: false,
      message: "That code is for first orders only.",
      code: "",
      amount: 0,
    };
  }

  const amount = Math.round((subtotal * data.percent_off) / 100);
  return { ok: true, message: `${data.percent_off}% off applied.`, code: data.code, amount };
}
