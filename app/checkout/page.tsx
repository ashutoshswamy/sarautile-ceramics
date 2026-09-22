"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";
import { Lock, ShieldCheck, PartyPopper, Tag } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import { useProducts } from "@/components/ProductsContext";
import { resolveCart } from "@/lib/cart";
import { applyDiscountCode, startPayment, placeOrder } from "./actions";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { user } = useUser();
  const { lines, clear } = useCart();
  const { findProduct } = useProducts();
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const { items, subtotal, count } = resolveCart(lines, findProduct);

  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountMsg, setDiscountMsg] = useState("");
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const total = subtotal - (discount?.amount ?? 0);

  async function handleApplyDiscount() {
    setCheckingDiscount(true);
    const result = await applyDiscountCode(discountInput, subtotal);
    setDiscountMsg(result.message);
    setDiscount(result.ok ? { code: result.code, amount: result.amount } : null);
    setCheckingDiscount(false);
  }

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setPlacing(true);

    const data = new FormData(e.currentTarget);
    const shipping = {
      email: String(data.get("email")),
      firstName: String(data.get("firstName")),
      lastName: String(data.get("lastName")),
      address: String(data.get("address")),
      city: String(data.get("city")),
      state: String(data.get("state")),
      pin: String(data.get("pin")),
    };

    const cartItems = items.map((item) => ({ slug: item.slug, qty: item.qty }));
    const discountCode = discount?.code ?? null;

    let razorpayOrder;
    try {
      razorpayOrder = await startPayment({ items: cartItems, discountCode });
    } catch {
      setError("Couldn't start payment - try again in a moment.");
      setPlacing(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.orderId,
      name: "Sara Utile Ceramics",
      prefill: { email: shipping.email, name: `${shipping.firstName} ${shipping.lastName}` },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await placeOrder({
            shipping,
            items: cartItems,
            discountCode,
            razorpay: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
          });
          clear();
          setPlaced(true);
        } catch {
          setError("Payment went through, but we couldn't record the order. Email us the payment ID from your receipt.");
        } finally {
          setPlacing(false);
        }
      },
      modal: {
        ondismiss: () => setPlacing(false),
      },
    });
    razorpay.open();
  }

  if (!user) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <h1 className="display-2">Sign in to check out</h1>
        <p className="lede text-[0.95rem]">
          Orders are tied to your account so you can find them again later.
        </p>
        <Link href="/signin?redirect_url=/checkout" className="btn btn-primary mt-2">
          Sign in
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <PartyPopper size={30} strokeWidth={1.5} className="text-terracotta" />
        <h1 className="display-2">Order placed</h1>
        <p className="lede text-[0.95rem]">
          We&apos;ll email you when it comes out of the kiln. Usually within the
          fortnight.
        </p>
        <Link href="/products" className="btn btn-primary mt-2">
          Back to the shop
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <h1 className="display-2">Nothing to check out</h1>
        <p className="lede text-[0.95rem]">Your cart is empty.</p>
        <Link href="/products" className="btn btn-primary mt-2">
          Find something
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x max-w-[960px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex items-center py-5 border-b border-rule">
        <span className="text-lg font-medium mr-auto">Sara Utile Ceramics</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
          <Lock size={12} strokeWidth={1.8} aria-hidden />
          Secure checkout
        </span>
      </div>

      <div className="grid gap-10 md:grid-cols-[1.15fr_.85fr] py-10 lg:gap-14">
        <form onSubmit={handlePay}>
          <h1 className="display-3 text-[1.5rem]">Where&apos;s it going?</h1>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5 mt-5">
            <label className="field-label col-span-2">
              Email
              <input
                name="email"
                type="email"
                required
                defaultValue={user.primaryEmailAddress?.emailAddress}
                placeholder="you@wherever.com"
                className="field"
              />
            </label>
            <label className="field-label">
              First name
              <input name="firstName" required defaultValue={user.firstName ?? ""} className="field" />
            </label>
            <label className="field-label">
              Last name
              <input name="lastName" required defaultValue={user.lastName ?? ""} className="field" />
            </label>
            <label className="field-label col-span-2">
              Address
              <input name="address" required className="field" />
            </label>
            <label className="field-label">
              City
              <input name="city" required className="field" />
            </label>
            <label className="field-label">
              State
              <input name="state" required className="field" />
            </label>
            <label className="field-label col-span-2">
              PIN code
              <input name="pin" required className="field" />
            </label>
          </div>

          {error && (
            <p className="text-sm text-warn-ink mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="btn btn-primary btn-block mt-8 h-[3.25rem] text-base disabled:opacity-60"
          >
            <Lock size={16} strokeWidth={1.8} aria-hidden />
            {placing ? "Opening payment…" : `Pay ₹${total}`}
          </button>
        </form>

        <div>
          <div className="card bg-sand border-transparent p-6">
            <h3 className="display-3 text-[1.15rem]">
              {count} {count === 1 ? "piece" : "pieces"}
            </h3>
            <div className="flex flex-col gap-4 mt-4">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-3 items-center">
                  <PlaceholderPhoto
                    label={item.product.photoLabel}
                    src={item.product.imageUrl}
                    rounded="rounded-[16px]"
                    className="w-14 h-14 flex-none"
                    sizes="56px"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.product.name}</span>
                    <br />
                    <span className="text-xs text-ink-faint">×{item.qty}</span>
                  </div>
                  <span className="text-sm">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="divider my-5" />

            <div className="flex gap-2">
              <input
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Discount code"
                className="field flex-1 h-10 text-sm"
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={checkingDiscount || !discountInput.trim()}
                className="btn btn-ghost h-10 text-sm disabled:opacity-60"
              >
                <Tag size={14} strokeWidth={1.8} aria-hidden />
                Apply
              </button>
            </div>
            {discountMsg && (
              <p className={`text-xs mt-2 ${discount ? "text-sage-ink" : "text-warn-ink"}`}>
                {discountMsg}
              </p>
            )}

            <div className="divider my-5" />
            <div className="flex text-sm text-ink-soft">
              <span>Subtotal</span>
              <span className="ml-auto">₹{subtotal}</span>
            </div>
            {discount && (
              <div className="flex text-sm text-sage-ink mt-1.5">
                <span>Discount ({discount.code})</span>
                <span className="ml-auto">-₹{discount.amount}</span>
              </div>
            )}
            <div className="flex text-lg font-medium mt-3">
              <span>Total</span>
              <span className="ml-auto">₹{total}</span>
            </div>
          </div>
          <div className="px-5 py-5">
            <span className="kicker inline-flex items-center gap-1.5">
              <ShieldCheck size={13} strokeWidth={1.8} aria-hidden />
              Two promises
            </span>
            <p className="text-sm leading-relaxed text-ink-soft mt-2.5">
              If it arrives broken, we throw you another — send a photo,
              that&apos;s it. And if it just isn&apos;t right for you, 30 days
              to send it back.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
