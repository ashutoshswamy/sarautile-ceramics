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

type WishlistContextValue = {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const logIfError = ({ error }: { error: unknown }) => {
  if (error) console.error("wishlist sync failed:", error);
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const supabase = useAuthedSupabase();
  const [slugs, setSlugs] = useState<string[]>([]);

  // Wishlist lives in Supabase per signed-in user - `slugs` exposed below is
  // forced to [] when signed out, so there's no stale state to clear here.
  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;
    supabase
      .from("wishlist_items")
      .select("mug_slug")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return console.error("wishlist load failed:", error);
        setSlugs((data ?? []).map((r) => r.mug_slug));
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, supabase]);

  const visibleSlugs = useMemo(() => (user ? slugs : []), [user, slugs]);
  const has = useCallback(
    (slug: string) => visibleSlugs.includes(slug),
    [visibleSlugs]
  );

  // Signed-out tap is a no-op rather than a redirect - the heart is a small,
  // low-commitment action scattered across product grids, not worth bouncing
  // someone off the page they're browsing.
  const toggle = useCallback(
    (slug: string) => {
      if (!user) return;
      setSlugs((prev) => {
        const has = prev.includes(slug);
        if (has) {
          supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", user.id)
            .eq("mug_slug", slug)
            .then(logIfError);
          return prev.filter((s) => s !== slug);
        }
        supabase
          .from("wishlist_items")
          .insert({ user_id: user.id, mug_slug: slug })
          .then(logIfError);
        return [...prev, slug];
      });
    },
    [user, supabase]
  );

  const remove = useCallback(
    (slug: string) => {
      if (!user) return;
      setSlugs((prev) => prev.filter((s) => s !== slug));
      supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("mug_slug", slug)
        .then(logIfError);
    },
    [user, supabase]
  );

  return (
    <WishlistContext.Provider
      value={{ slugs: visibleSlugs, count: visibleSlugs.length, has, toggle, remove }}
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
