"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Lock, ShieldCheck, Truck, Zap, Store, PartyPopper } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import { useMugs } from "@/components/MugsContext";
import { useAuthedSupabase } from "@/lib/useAuthedSupabase";
import { resolveCart, POSTAGE } from "@/lib/cart";

const SHIP = [
  { Icon: Truck, label: "Packed in straw, 3–5 days", price: "₹149", on: true },
  { Icon: Zap, label: "Next day (we'll wrap it twice)", price: "₹299", on: false },
  { Icon: Store, label: "Collect from the workshop, Fridays", price: "Free", on: false },
];

export default function CheckoutPage() {
  const { user } = useUser();
  const { lines, clear } = useCart();
  const { findMug } = useMugs();
  const supabase = useAuthedSupabase();
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const { items, subtotal, count } = resolveCart(lines, findMug);
  const total = subtotal + POSTAGE;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setPlacing(true);

    const data = new FormData(e.currentTarget);
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        email: data.get("email"),
        first_name: data.get("firstName"),
        last_name: data.get("lastName"),
        address: data.get("address"),
        city: data.get("city"),
        state: data.get("state"),
        pin: data.get("pin"),
        shipping_method: SHIP[0].label,
        note: data.get("note") || null,
        subtotal,
        postage: POSTAGE,
        total,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      setError("Couldn't place the order - try again in a moment.");
      setPlacing(false);
      return;
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        user_id: user.id,
        mug_slug: item.slug,
        glaze: item.glaze,
        qty: item.qty,
        unit_price: item.mug.price,
      }))
    );
    if (itemsErr) {
      setError("Couldn't place the order - try again in a moment.");
      setPlacing(false);
      return;
    }

    clear();
    setPlacing(false);
    setPlaced(true);
  }

  if (!user) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <h1 className="display-2">Sign in to check out</h1>
        <p className="lede text-[0.95rem]">
          Orders are tied to your account so you can find them again later.
        </p>
        <Link href="/signin" className="btn btn-primary mt-2">
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
        <Link href="/mugs" className="btn btn-primary mt-2">
          Back to the mugs
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <h1 className="display-2">Nothing to check out</h1>
        <p className="lede text-[0.95rem]">Your cart is empty.</p>
        <Link href="/mugs" className="btn btn-primary mt-2">
          Find a mug
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x max-w-[960px]">
      <div className="flex items-center py-5 border-b border-rule">
        <span className="text-lg font-medium mr-auto">Sarautile Ceramics</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
          <Lock size={12} strokeWidth={1.8} aria-hidden />
          Secure checkout
        </span>
      </div>

      <div className="grid gap-10 md:grid-cols-[1.15fr_.85fr] py-10 lg:gap-14">
        <form onSubmit={placeOrder}>
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
              <input name="firstName" required className="field" />
            </label>
            <label className="field-label">
              Last name
              <input name="lastName" required className="field" />
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

          <h2 className="display-3 text-[1.25rem] mt-10">Post</h2>
          <div className="flex flex-col gap-2.5 mt-4">
            {SHIP.map((s) => (
              <span
                key={s.label}
                className={`flex items-center gap-3 px-4.5 py-3.5 rounded-3xl border text-sm ${
                  s.on ? "border-terracotta bg-warn-bg" : "border-rule"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex-none ${
                    s.on ? "bg-terracotta" : "border border-ink-faint"
                  }`}
                />
                <s.Icon
                  size={16}
                  strokeWidth={1.7}
                  className={`flex-none ${s.on ? "text-warn-ink" : "text-ink-faint"}`}
                  aria-hidden
                />
                {s.label}
                <span className="ml-auto">{s.price}</span>
              </span>
            ))}
          </div>

          <label className="field-label mt-8">
            Note on the card (optional)
            <textarea
              name="note"
              placeholder="Happy birthday, drink something nice out of this."
              className="field"
            />
          </label>

          {error && (
            <p className="text-sm text-warn-ink mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="btn btn-primary btn-block mt-8 h-[3.25rem] text-base disabled:opacity-60"
          >
            <Lock size={16} strokeWidth={1.8} aria-hidden />
            {placing ? "Placing order…" : `Pay ₹${total}`}
          </button>
        </form>

        <div>
          <div className="card bg-sand border-transparent p-6">
            <h3 className="display-3 text-[1.15rem]">
              {count} {count === 1 ? "mug" : "mugs"}
            </h3>
            <div className="flex flex-col gap-4 mt-4">
              {items.map((item) => (
                <div key={`${item.slug}-${item.glaze}`} className="flex gap-3 items-center">
                  <PlaceholderPhoto
                    label={item.mug.photoLabel}
                    rounded="rounded-[16px]"
                    className="w-14 h-14 flex-none"
                    sizes="56px"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.mug.name}</span>
                    <br />
                    <span className="text-xs text-ink-faint">
                      {item.glaze} · ×{item.qty}
                    </span>
                  </div>
                  <span className="text-sm">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="divider my-5" />
            <div className="flex text-sm text-ink-soft">
              <span>Subtotal</span>
              <span className="ml-auto">₹{subtotal}</span>
            </div>
            <div className="flex text-sm text-ink-soft mt-1.5">
              <span>Post</span>
              <span className="ml-auto">₹{POSTAGE}</span>
            </div>
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
              If it arrives in pieces, we throw you another — send a photo,
              that&apos;s it. And if it just isn&apos;t your mug, 30 days to
              send it back.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
