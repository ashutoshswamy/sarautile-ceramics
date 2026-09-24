"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthedSupabase } from "@/lib/useAuthedSupabase";
import type { CartLine } from "@/lib/cart";

// Signed-out cart lives in localStorage so people can add to cart before
// signing in - checkout is what actually requires an account. Merged into
// Supabase (see the load effect below) the moment they sign in.
const GUEST_CART_KEY = "guest_cart";

function readGuestCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: CartLine[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // ponytail: best-effort persistence, cart still works in-memory for the tab
  }
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : JSON.stringify(error);

const logIfError = ({ error }: { error: unknown }) => {
  if (error) console.error("cart sync failed:", describeError(error));
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const supabase = useAuthedSupabase();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  // Signed out: load whatever's in localStorage. Signed in: merge any guest
  // cart into Supabase (summing quantities with what's already there, capped
  // at 9) and load from there from then on.
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      if (!userId) {
        setLines(readGuestCart());
        return;
      }
      const guest = readGuestCart();
      const { data, error } = await supabase.from("cart_items").select("product_slug, qty");
      if (cancelled) return;
      if (error) {
        console.error("cart load failed:", describeError(error));
        return;
      }
      const existing = (data ?? []).map((r) => ({ slug: r.product_slug, qty: r.qty }));
      if (guest.length === 0) {
        setLines(existing);
        return;
      }
      const merged = new Map(existing.map((l) => [l.slug, l.qty]));
      for (const g of guest) merged.set(g.slug, Math.min(9, (merged.get(g.slug) ?? 0) + g.qty));
      const mergedLines = Array.from(merged, ([slug, qty]) => ({ slug, qty }));
      const { error: upsertErr } = await supabase.from("cart_items").upsert(
        mergedLines.map((l) => ({ user_id: userId, product_slug: l.slug, qty: l.qty })),
        { onConflict: "user_id,product_slug" }
      );
      if (upsertErr) console.error("cart merge failed:", describeError(upsertErr));
      localStorage.removeItem(GUEST_CART_KEY);
      if (!cancelled) setLines(mergedLines);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, supabase]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      setLines((prev) => {
        const hit = prev.find((l) => l.slug === slug);
        const nextQty = Math.min(9, (hit?.qty ?? 0) + qty);
        const next = hit
          ? prev.map((l) => (l === hit ? { ...l, qty: nextQty } : l))
          : [...prev, { slug, qty: nextQty }];
        if (user) {
          supabase
            .from("cart_items")
            .upsert(
              { user_id: user.id, product_slug: slug, qty: nextQty },
              { onConflict: "user_id,product_slug" }
            )
            .then(logIfError);
        } else {
          writeGuestCart(next);
        }
        return next;
      });
    },
    [user, supabase]
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      if (qty <= 0) {
        setLines((prev) => {
          const next = prev.filter((l) => l.slug !== slug);
          if (user) {
            supabase
              .from("cart_items")
              .delete()
              .eq("user_id", user.id)
              .eq("product_slug", slug)
              .then(logIfError);
          } else {
            writeGuestCart(next);
          }
          return next;
        });
        return;
      }
      const clamped = Math.min(9, qty);
      setLines((prev) => {
        const next = prev.map((l) => (l.slug === slug ? { ...l, qty: clamped } : l));
        if (user) {
          supabase
            .from("cart_items")
            .update({ qty: clamped })
            .eq("user_id", user.id)
            .eq("product_slug", slug)
            .then(logIfError);
        } else {
          writeGuestCart(next);
        }
        return next;
      });
    },
    [user, supabase]
  );

  const remove = useCallback(
    (slug: string) => {
      setLines((prev) => {
        const next = prev.filter((l) => l.slug !== slug);
        if (user) {
          supabase
            .from("cart_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_slug", slug)
            .then(logIfError);
        } else {
          writeGuestCart(next);
        }
        return next;
      });
    },
    [user, supabase]
  );

  const clear = useCallback(() => {
    setLines([]);
    if (user) {
      supabase.from("cart_items").delete().eq("user_id", user.id).then(logIfError);
    } else {
      writeGuestCart([]);
    }
  }, [user, supabase]);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, count, add, setQty, remove, clear, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
