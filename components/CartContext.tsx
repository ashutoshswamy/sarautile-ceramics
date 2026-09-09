"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { load, save } from "@/lib/storage";
import type { CartLine } from "@/lib/cart";

const KEY = "sarautile.cart";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, glaze: string, qty?: number) => void;
  setQty: (slug: string, glaze: string, qty: number) => void;
  remove: (slug: string, glaze: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const sameLine = (l: CartLine, slug: string, glaze: string) =>
  l.slug === slug && l.glaze === glaze;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  // first run hydrates from localStorage; subsequent runs persist.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      setLines(load<CartLine[]>(KEY, []));
      return;
    }
    save(KEY, lines);
  }, [lines]);

  const add = useCallback((slug: string, glaze: string, qty = 1) => {
    setLines((prev) => {
      const hit = prev.find((l) => sameLine(l, slug, glaze));
      if (hit) {
        return prev.map((l) =>
          l === hit ? { ...l, qty: Math.min(9, l.qty + qty) } : l
        );
      }
      return [...prev, { slug, glaze, qty: Math.min(9, qty) }];
    });
  }, []);

  const setQty = useCallback((slug: string, glaze: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !sameLine(l, slug, glaze))
        : prev.map((l) =>
            sameLine(l, slug, glaze) ? { ...l, qty: Math.min(9, qty) } : l
          )
    );
  }, []);

  const remove = useCallback((slug: string, glaze: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, slug, glaze)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(
    () => lines.reduce((n, l) => n + l.qty, 0),
    [lines]
  );

  return (
    <CartContext.Provider
      value={{ lines, count, add, setQty, remove, clear, open, setOpen }}
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
