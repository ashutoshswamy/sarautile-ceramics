import type { Product } from "@/lib/data";

/** Cost of a line: every full set of setSize costs setPrice, the rest full price. */
export function linePrice(price: number, setPrice: number | null, setSize: number, qty: number) {
  if (!setPrice) return price * qty;
  return Math.floor(qty / setSize) * setPrice + (qty % setSize) * price;
}

export type CartLine = { slug: string; qty: number };

export type ResolvedLine = CartLine & { product: Product; lineTotal: number };

/** Join stored cart lines to live product data (via the caller's lookup -
 *  the catalog now comes from Supabase, see ProductsContext). Lines for
 *  products that no longer exist are dropped. */
export function resolveCart(
  lines: CartLine[],
  findProduct: (slug: string) => Product | undefined
) {
  const items: ResolvedLine[] = [];
  for (const line of lines) {
    const product = findProduct(line.slug);
    if (product) items.push({ ...line, product, lineTotal: linePrice(product.price, product.setPrice, product.setSize, line.qty) });
  }
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const count = items.reduce((n, i) => n + i.qty, 0);
  return { items, subtotal, count };
}
