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

export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.description ?? "Could not start payment.");
  return data as { id: string; amount: number; currency: string };
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
  return expected === signature;
}
