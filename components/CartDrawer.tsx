"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import { cartLines } from "@/lib/data";

export default function CartDrawer() {
  const { open, setOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Keep the drawer mounted through its slide-out so the exit animates.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const id = setTimeout(() => setMounted(false), 450);
    return () => clearTimeout(id);
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!mounted) return null;

  const subtotal = cartLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const post = 149;

  return (
    <div className="cart-overlay" data-open={visible}>
      <div
        className="cart-overlay__scrim"
        onClick={() => setOpen(false)}
      />
      <div
        className="cart-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
      >
        <div className="flex items-baseline gap-2.5 px-6 pt-6 pb-4 border-b border-rule">
          <h3 className="display-3 text-[1.35rem]">Your cart</h3>
          <span className="text-xs text-ink-faint">
            {cartLines.reduce((n, l) => n + l.qty, 0)} mugs
          </span>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto text-xl text-ink-soft cursor-pointer leading-none transition-colors hover:text-ink"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          {cartLines.map((line, i) => (
            <div key={i} className="flex gap-3.5">
              <PlaceholderPhoto
                label={`${line.name} ${line.glaze}`}
                rounded="rounded-[18px]"
                className="w-[72px] h-[72px] flex-none"
                sizes="72px"
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[0.95rem]">
                    {line.name}
                  </span>
                  <span className="ml-auto text-sm">₹{line.price}</span>
                </div>
                <span className="text-xs text-ink-faint">
                  {line.glaze} · 12 oz
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-2.5 border border-rule-strong rounded-full px-3 py-1 text-sm">
                    – {line.qty} +
                  </span>
                  <span className="text-xs text-ink-faint cursor-pointer transition-colors hover:text-ink">
                    Remove
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="card bg-sage-bg border-transparent px-4.5 py-4">
            <span className="text-sm font-medium text-sage-ink">
              Wrap it in newspaper and string?
            </span>
            <p className="text-xs leading-relaxed text-sage-ink-soft mt-1.5">
              Free. We&apos;ll write your note on a card.{" "}
              <span className="underline cursor-pointer">Add a note</span>
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5 border-t border-rule">
          <div className="flex text-sm text-ink-soft">
            <span>Subtotal</span>
            <span className="ml-auto">₹{subtotal}</span>
          </div>
          <div className="flex text-sm text-ink-soft mt-1.5">
            <span>Post (packed in straw)</span>
            <span className="ml-auto">₹{post}</span>
          </div>
          <div className="flex text-lg font-medium mt-3">
            <span>Total</span>
            <span className="ml-auto">₹{subtotal + post}</span>
          </div>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className="btn btn-primary btn-block mt-4"
          >
            Checkout
          </Link>
          <p className="text-xs text-ink-faint mt-3 text-center">
            Breakages replaced, no questions.
          </p>
        </div>
      </div>
    </div>
  );
}
