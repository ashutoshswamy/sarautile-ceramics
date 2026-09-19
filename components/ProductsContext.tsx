"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/data";

// Client-side mirror of lib/queries.ts's getProducts(), for the few client
// components (cart drawer, checkout, wishlist) that need to resolve a
// slug back to a Product. Catalog is public and small - one fetch on mount,
// no realtime sync.
type ProductsContextValue = {
  products: Product[];
  findProduct: (slug: string) => Product | undefined;
  loading: boolean;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("products").select("*").order("created_at"),
      supabase.from("product_images").select("*").order("position"),
    ]).then(([{ data: productRows, error: productErr }, { data: imageRows, error: imageErr }]) => {
      if (cancelled) return;
      if (productErr || imageErr) {
        console.error("catalog load failed:", productErr ?? imageErr);
        setLoading(false);
        return;
      }
      const assembled: Product[] = (productRows ?? []).map((p) => ({
        slug: p.slug,
        name: p.name,
        price: p.price,
        weight: p.weight,
        left: `${p.left_count} left`,
        photoLabel: p.photo_label,
        imageUrl: p.image_url,
        images: (imageRows ?? [])
          .filter((i) => i.product_slug === p.slug)
          .sort((a, b) => a.position - b.position)
          .map((i) => i.url),
        categorySlug: p.category_slug,
      }));
      setProducts(assembled);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const findProduct = (slug: string) => products.find((p) => p.slug === slug);

  return (
    <ProductsContext.Provider value={{ products, findProduct, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
