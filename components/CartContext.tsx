"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuthedSupabase } from "@/lib/useAuthedSupabase";
import type { CartLine } from "@/lib/cart";

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
  const supabase = useAuthedSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  // Cart lives in Supabase per signed-in user - nothing to load when signed
  // out (the `lines` exposed below is forced to [] in that case, so there's
  // no stale state to clear here).
  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;
    supabase
      .from("cart_items")
      .select("product_slug, qty")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return console.error("cart load failed:", describeError(error));
        setLines((data ?? []).map((r) => ({ slug: r.product_slug, qty: r.qty })));
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, supabase]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      if (!user) {
        router.push(`/signin?redirect_url=${encodeURIComponent(pathname)}`);
        return;
      }
      setLines((prev) => {
        const hit = prev.find((l) => l.slug === slug);
        const nextQty = Math.min(9, (hit?.qty ?? 0) + qty);
        supabase
          .from("cart_items")
          .upsert(
            { user_id: user.id, product_slug: slug, qty: nextQty },
            { onConflict: "user_id,product_slug" }
          )
          .then(logIfError);
        return hit
          ? prev.map((l) => (l === hit ? { ...l, qty: nextQty } : l))
          : [...prev, { slug, qty: nextQty }];
      });
    },
    [user, supabase, router, pathname]
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      if (!user) return;
      if (qty <= 0) {
        setLines((prev) => prev.filter((l) => l.slug !== slug));
        supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_slug", slug)
          .then(logIfError);
        return;
      }
      const clamped = Math.min(9, qty);
      setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, qty: clamped } : l)));
      supabase
        .from("cart_items")
        .update({ qty: clamped })
        .eq("user_id", user.id)
        .eq("product_slug", slug)
        .then(logIfError);
    },
    [user, supabase]
  );

  const remove = useCallback(
    (slug: string) => {
      if (!user) return;
      setLines((prev) => prev.filter((l) => l.slug !== slug));
      supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_slug", slug)
        .then(logIfError);
    },
    [user, supabase]
  );

  const clear = useCallback(() => {
    if (!user) return;
    setLines([]);
    supabase.from("cart_items").delete().eq("user_id", user.id).then(logIfError);
  }, [user, supabase]);

  const visibleLines = useMemo(() => (user ? lines : []), [user, lines]);
  const count = useMemo(
    () => visibleLines.reduce((n, l) => n + l.qty, 0),
    [visibleLines]
  );

  return (
    <CartContext.Provider
      value={{ lines: visibleLines, count, add, setQty, remove, clear, open, setOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
