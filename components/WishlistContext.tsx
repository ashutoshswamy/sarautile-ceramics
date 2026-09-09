"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { load, save } from "@/lib/storage";

const KEY = "sarautile.wishlist";

type WishlistContextValue = {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      setSlugs(load<string[]>(KEY, []));
      return;
    }
    save(KEY, slugs);
  }, [slugs]);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  return (
    <WishlistContext.Provider
      value={{ slugs, count: slugs.length, has, toggle, remove }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
