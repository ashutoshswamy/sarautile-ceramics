"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cartLines } from "@/lib/data";

type CartContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const count = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.qty, 0),
    []
  );

  return (
    <CartContext.Provider value={{ open, setOpen, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
