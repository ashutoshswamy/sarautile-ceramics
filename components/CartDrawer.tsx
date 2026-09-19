"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { useCart } from "@/components/CartContext";
import { useProducts } from "@/components/ProductsContext";
import { resolveCart } from "@/lib/cart";

export default function CartDrawer() {
  const { open, setOpen, lines, setQty, remove } = useCart();
  const { findProduct } = useProducts();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Keep the drawer mounted through its slide-out so the exit animates.
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Double rAF: let the browser paint the closed state first, otherwise the
      // open transition has no "from" frame and the panel just snaps in.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
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

  const { items, subtotal, count } = resolveCart(lines, findProduct);

  return (
    <div className="cart-overlay" data-open={visible}>
      <div className="cart-overlay__scrim" onClick={() => setOpen(false)} />
      <div
        className="cart-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
      >
        <div className="flex items-baseline gap-2.5 px-6 pt-6 pb-4 border-b border-rule">
          <h3 className="display-3 text-[1.35rem]">Your cart</h3>
          <span className="text-xs text-ink-faint">
            {count} {count === 1 ? "piece" : "pieces"}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto -mr-1 flex items-center text-ink-soft cursor-pointer transition-colors hover:text-ink"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={26} strokeWidth={1.5} className="text-ink-faint" />
            <p className="text-sm text-ink-soft">Your cart is empty.</p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="btn btn-ghost"
            >
              Find something
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-3.5">
                  <PlaceholderPhoto
                    label={item.product.photoLabel}
                    src={item.product.imageUrl}
                    rounded="rounded-[18px]"
                    className="w-[72px] h-[72px] flex-none"
                    sizes="72px"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-[0.95rem]">
                        {item.product.name}
                      </span>
                      <span className="ml-auto text-sm">₹{item.lineTotal}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-3 border border-rule-strong rounded-full px-3 py-1 text-sm">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          className="cursor-pointer text-ink-soft leading-none hover:text-ink"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        {item.qty}
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className="cursor-pointer text-ink-soft leading-none hover:text-ink"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </span>
                      <button
                        onClick={() => remove(item.slug)}
                        className="inline-flex items-center gap-1 text-xs text-ink-faint cursor-pointer transition-colors hover:text-ink"
                      >
                        <Trash2 size={12} strokeWidth={1.8} aria-hidden />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 pt-5 border-t border-rule">
              <div className="flex text-lg font-medium">
                <span>Total</span>
                <span className="ml-auto">₹{subtotal}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="btn btn-primary btn-block mt-4"
              >
                Checkout
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
              </Link>
              <p className="text-xs text-ink-faint mt-3 text-center">
                Breakages replaced, no questions.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
