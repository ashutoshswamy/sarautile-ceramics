"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Mug, Glaze } from "@/lib/data";

// Client-side mirror of lib/queries.ts's getMugs(), for the few client
// components (cart drawer, checkout, wishlist) that need to resolve a
// slug back to a Mug. Catalog is public and small - one fetch on mount,
// no realtime sync.
type MugsContextValue = {
  mugs: Mug[];
  findMug: (slug: string) => Mug | undefined;
  loading: boolean;
};

const MugsContext = createContext<MugsContextValue | null>(null);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function MugsProvider({ children }: { children: React.ReactNode }) {
  const [mugs, setMugs] = useState<Mug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("mugs").select("*").order("created_at"),
      supabase.from("glazes").select("*").order("id"),
    ]).then(([{ data: mugRows, error: mugErr }, { data: glazeRows, error: glazeErr }]) => {
      if (cancelled) return;
      if (mugErr || glazeErr) {
        console.error("catalog load failed:", mugErr ?? glazeErr);
        setLoading(false);
        return;
      }
      const assembled: Mug[] = (mugRows ?? []).map((m) => ({
        slug: m.slug,
        name: m.name,
        price: m.price,
        oz: m.oz,
        note: m.note,
        left: `${m.left_count} left`,
        photoLabel: m.photo_label,
        categorySlug: m.category_slug,
        glazes: (glazeRows ?? [])
          .filter((g) => g.mug_slug === m.slug)
          .map(
            (g): Glaze => ({ name: g.name, hex: g.hex, desc: g.description, shot: g.shot })
          ),
      }));
      setMugs(assembled);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const findMug = (slug: string) => mugs.find((m) => m.slug === slug);

  return (
    <MugsContext.Provider value={{ mugs, findMug, loading }}>
      {children}
    </MugsContext.Provider>
  );
}

export function useMugs() {
  const ctx = useContext(MugsContext);
  if (!ctx) throw new Error("useMugs must be used within MugsProvider");
  return ctx;
}
