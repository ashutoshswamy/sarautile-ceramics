import type { Mug } from "@/lib/data";

export const POSTAGE = 149;

export type CartLine = { slug: string; glaze: string; qty: number };

export type ResolvedLine = CartLine & { mug: Mug; lineTotal: number };

/** Join stored cart lines to live mug data (via the caller's lookup - the
 *  catalog now comes from Supabase, see MugsContext). Lines for mugs that no
 *  longer exist are dropped. */
export function resolveCart(lines: CartLine[], findMug: (slug: string) => Mug | undefined) {
  const items: ResolvedLine[] = [];
  for (const line of lines) {
    const mug = findMug(line.slug);
    if (mug) items.push({ ...line, mug, lineTotal: mug.price * line.qty });
  }
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const count = items.reduce((n, i) => n + i.qty, 0);
  return { items, subtotal, count };
}
