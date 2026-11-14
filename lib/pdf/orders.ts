import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type PdfOrder = {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string | null;
  discount_code: string | null;
  discount_amount: number;
  subtotal: number;
  total: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  created_at: string;
  items: { name: string; qty: number; unit_price: number; line_total: number }[];
  kg: number;
};

// "450g" / "1.2 kg" -> kg; anything unparseable -> 0.5
export function kg(text: string | null) {
  const m = text?.match(/([\d.]+)\s*(kg|g)?/i);
  if (!m) return 0.5;
  const n = parseFloat(m[1]);
  return m[2]?.toLowerCase() === "kg" ? n : n / 1000 || 0.5;
}

// Orders + their line items + parcel weight, for invoices and labels.
export async function loadPdfOrders(filter: { ids: number[] } | { statuses: string[] }) {
  const supabase = getSupabaseAdmin();
  let q = supabase.from("orders").select("*").order("id");
  q = "ids" in filter ? q.in("id", filter.ids) : q.in("status", filter.statuses);
  const { data: orders } = await q.returns<Omit<PdfOrder, "items" | "kg">[]>();

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_slug, qty, unit_price, line_total")
    .in("order_id", (orders ?? []).map((o) => o.id));
  const { data: products } = await supabase
    .from("products")
    .select("slug, name, weight")
    .in("slug", [...new Set((items ?? []).map((i) => i.product_slug))]);
  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));

  return (orders ?? []).map((o): PdfOrder => {
    const mine = (items ?? []).filter((i) => i.order_id === o.id);
    return {
      ...o,
      items: mine.map((i) => ({
        name: bySlug.get(i.product_slug)?.name ?? i.product_slug,
        qty: i.qty,
        unit_price: i.unit_price,
        line_total: i.line_total,
      })),
      kg:
        Math.round(
          mine.reduce((s, i) => s + kg(bySlug.get(i.product_slug)?.weight ?? null) * i.qty, 0) * 100
        ) / 100,
    };
  });
}

// ?id=1&id=2 -> orders; no ids -> everything still to ship.
export function filterFromRequest(req: Request): { ids: number[] } | { statuses: string[] } {
  const ids = new URL(req.url)
    .searchParams.getAll("id")
    .map(Number)
    .filter(Number.isInteger)
    .slice(0, 200);
  return ids.length ? { ids } : { statuses: ["pending", "processing"] };
}
