import "server-only";
import crypto from "crypto";

// Thin fetch wrapper over the Razorpay REST API - no SDK, both operations
// this app needs (create an order, verify a payment signature) are a
// couple of lines each.
function authHeader() {
  const key = process.env.RAZORPAY_KEY_ID!;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string,
  notes: Record<string, string>
) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt, notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.description ?? "Could not start payment.");
  return data as { id: string; amount: number; currency: string };
}

/** Server-side read of a Razorpay order - the source of truth for what was
 * actually charged and who it was created for (see `notes`). */
export async function fetchRazorpayOrder(orderId: string) {
  const res = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: authHeader() }, cache: "no-store" }
  );
  if (!res.ok) throw new Error("Payment could not be verified.");
  return (await res.json()) as {
    id: string;
    amount: number;
    amount_paid: number;
    currency: string;
    status: string;
    notes: Record<string, string> | [];
  };
}

/** HMAC-SHA256 check per Razorpay's checkout callback verification docs. */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
