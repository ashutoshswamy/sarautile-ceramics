"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/data";

// Client-side mirror of lib/queries.ts's getProducts()/getCategories()/
// getCollectionsWithProducts(), for the few client components (cart drawer,
// checkout, wishlist, header search) that need the catalog without a round
// trip. Catalog is public and small - one fetch on mount, no realtime sync.
export type CatalogEntry = { slug: string; name: string };

type ProductsContextValue = {
  products: Product[];
  categories: CatalogEntry[];
  collections: CatalogEntry[];
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
  const [categories, setCategories] = useState<CatalogEntry[]>([]);
  const [collections, setCollections] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("products").select("*").order("created_at"),
      supabase.from("product_images").select("*").order("position"),
      supabase.from("categories").select("slug, name").order("name"),
      supabase.from("collections").select("slug, name").order("name"),
    ]).then(
      ([
        { data: productRows, error: productErr },
        { data: imageRows, error: imageErr },
        { data: categoryRows, error: categoryErr },
        { data: collectionRows, error: collectionErr },
      ]) => {
        if (cancelled) return;
        if (productErr || imageErr || categoryErr || collectionErr) {
          console.error(
            "catalog load failed:",
            productErr ?? imageErr ?? categoryErr ?? collectionErr
          );
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
          description: p.description,
        }));
        setProducts(assembled);
        setCategories(categoryRows ?? []);
        setCollections(collectionRows ?? []);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const findProduct = (slug: string) => products.find((p) => p.slug === slug);

  return (
    <ProductsContext.Provider
      value={{ products, categories, collections, findProduct, loading }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
