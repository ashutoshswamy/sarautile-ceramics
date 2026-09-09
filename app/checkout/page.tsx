import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { cartLines } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout — Sarautile Ceramics" };

export default function CheckoutPage() {
  const subtotal = cartLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const post = 149;
  const total = subtotal + post;

  return (
    <div className="container-x max-w-[960px]">
      <div className="flex items-center py-5 border-b border-rule">
        <span className="text-lg font-medium mr-auto">Sarautile Ceramics</span>
        <span className="text-xs text-ink-faint">Secure checkout</span>
      </div>

      <div className="grid gap-10 md:grid-cols-[1.15fr_.85fr] py-10 lg:gap-14">
        <div>
          <h1 className="display-3 text-[1.5rem]">Where&apos;s it going?</h1>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5 mt-5">
            <label className="field-label col-span-2">
              Email
              <input
                type="email"
                placeholder="you@wherever.com"
                className="field"
              />
            </label>
            <label className="field-label">
              First name
              <input className="field" />
            </label>
            <label className="field-label">
              Last name
              <input className="field" />
            </label>
            <label className="field-label col-span-2">
              Address
              <input className="field" />
            </label>
            <label className="field-label">
              City
              <input className="field" />
            </label>
            <label className="field-label">
              State
              <input className="field" />
            </label>
            <label className="field-label col-span-2">
              PIN code
              <input className="field" />
            </label>
          </div>

          <h2 className="display-3 text-[1.25rem] mt-10">Post</h2>
          <div className="flex flex-col gap-2.5 mt-4">
            <span className="flex items-center gap-3 px-4.5 py-3.5 rounded-3xl border border-terracotta bg-warn-bg text-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-terracotta flex-none" />
              Packed in straw, 3–5 days
              <span className="ml-auto">₹149</span>
            </span>
            <span className="flex items-center gap-3 px-4.5 py-3.5 rounded-3xl border border-rule text-sm">
              <span className="w-3.5 h-3.5 rounded-full border border-ink-faint flex-none" />
              Next day (we&apos;ll wrap it twice)
              <span className="ml-auto">₹299</span>
            </span>
            <span className="flex items-center gap-3 px-4.5 py-3.5 rounded-3xl border border-rule text-sm">
              <span className="w-3.5 h-3.5 rounded-full border border-ink-faint flex-none" />
              Collect from the workshop, Fridays
              <span className="ml-auto">Free</span>
            </span>
          </div>

          <label className="field-label mt-8">
            Note on the card (optional)
            <textarea
              placeholder="Happy birthday, drink something nice out of this."
              className="field"
            />
          </label>

          <button className="btn btn-primary btn-block mt-8 h-[3.25rem] text-base">
            Pay ₹{total}
          </button>
        </div>

        <div>
          <div className="card bg-sand border-transparent p-6">
            <h3 className="display-3 text-[1.15rem]">
              {cartLines.reduce((n, l) => n + l.qty, 0)} mugs
            </h3>
            <div className="flex flex-col gap-4 mt-4">
              {cartLines.map((line, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <PlaceholderPhoto
                    label={`${line.name} ${line.glaze}`}
                    rounded="rounded-[16px]"
                    className="w-14 h-14 flex-none"
                    sizes="56px"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{line.name}</span>
                    <br />
                    <span className="text-xs text-ink-faint">
                      {line.glaze} · ×{line.qty}
                    </span>
                  </div>
                  <span className="text-sm">₹{line.price}</span>
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
              <span className="ml-auto">₹{post}</span>
            </div>
            <div className="flex text-lg font-medium mt-3">
              <span>Total</span>
              <span className="ml-auto">₹{total}</span>
            </div>
          </div>
          <div className="px-5 py-5">
            <span className="kicker">Two promises</span>
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
