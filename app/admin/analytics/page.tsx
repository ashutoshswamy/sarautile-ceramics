import Link from "next/link";
import { IndianRupee, Receipt, TrendingUp, PackageX } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const LOW_STOCK_THRESHOLD = 5;
const TREND_DAYS = 30;

type OrderRow = { id: number; total: number; created_at: string };
type ItemRow = { product_slug: string; qty: number; unit_price: number };
type ProductRow = { slug: string; name: string; left_count: number };

export default async function AdminAnalyticsPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: orders }, { data: items }, { data: products }] = await Promise.all([
    supabase.from("orders").select("id, total, created_at").returns<OrderRow[]>(),
    supabase.from("order_items").select("product_slug, qty, unit_price").returns<ItemRow[]>(),
    supabase.from("products").select("slug, name, left_count").returns<ProductRow[]>(),
  ]);

  const allOrders = orders ?? [];
  const allItems = items ?? [];
  const allProducts = products ?? [];
  const productName = new Map(allProducts.map((p) => [p.slug, p.name]));

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = allOrders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const lowStockProducts = allProducts
    .filter((p) => p.left_count <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.left_count - b.left_count);

  // Daily revenue for the trailing TREND_DAYS days, keyed by ISO date.
  const today = new Date();
  const days = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (TREND_DAYS - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = new Map(days.map((d) => [d, 0]));
  for (const o of allOrders) {
    const key = o.created_at.slice(0, 10);
    if (revenueByDay.has(key)) revenueByDay.set(key, revenueByDay.get(key)! + o.total);
  }
  const maxDay = Math.max(1, ...revenueByDay.values());

  const productTotals = new Map<string, { qty: number; revenue: number }>();
  for (const it of allItems) {
    const cur = productTotals.get(it.product_slug) ?? { qty: 0, revenue: 0 };
    cur.qty += it.qty;
    cur.revenue += it.qty * it.unit_price;
    productTotals.set(it.product_slug, cur);
  }
  const topProducts = Array.from(productTotals.entries())
    .map(([slug, t]) => ({ slug, name: productName.get(slug) ?? slug, ...t }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const TILES = [
    { label: "Total revenue", value: rupees(totalRevenue), Icon: IndianRupee },
    { label: "Orders placed", value: totalOrders, Icon: Receipt },
    { label: "Avg. order value", value: rupees(avgOrderValue), Icon: TrendingUp },
    { label: "Low / out of stock", value: lowStockProducts.length, Icon: PackageX },
  ];

  return (
    <div>
      <h1 className="display-2">Analytics</h1>
      <p className="lede text-[0.95rem] mt-2">Revenue, top sellers, and stock health.</p>

      <div className="grid sm:grid-cols-4 gap-5 mt-8">
        {TILES.map((t) => (
          <div key={t.label} className="card p-5">
            <t.Icon size={18} strokeWidth={1.6} className="text-terracotta" />
            <p className="text-2xl font-medium text-ink mt-3">{t.value}</p>
            <p className="text-xs text-ink-soft mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <span className="kicker">Revenue, last {TREND_DAYS} days</span>
        {totalRevenue === 0 ? (
          <p className="text-sm text-ink-faint mt-3">No orders yet.</p>
        ) : (
          <div className="flex items-end gap-[3px] h-32 mt-4 border-b border-rule pb-1">
            {days.map((d) => {
              const v = revenueByDay.get(d) ?? 0;
              return (
                <div
                  key={d}
                  title={`${d}: ${rupees(v)}`}
                  className="flex-1 bg-terracotta-light rounded-t-sm transition-colors hover:bg-terracotta"
                  style={{ height: `${Math.max(2, (v / maxDay) * 100)}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-10">
        <div>
          <span className="kicker">Top products by revenue</span>
          {topProducts.length === 0 ? (
            <p className="text-sm text-ink-faint mt-3">No sales yet.</p>
          ) : (
            <div className="mt-3 border border-rule rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Sold</th>
                    <th className="px-4 py-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.slug} className="border-t border-rule">
                      <td className="px-4 py-3 text-ink">
                        <Link
                          href={`/admin/products/${p.slug}`}
                          className="text-ink no-underline hover:text-terracotta"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">×{p.qty}</td>
                      <td className="px-4 py-3 text-ink-soft">{rupees(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <span className="kicker">Needs restocking</span>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink-faint mt-3">
              Everything&apos;s above {LOW_STOCK_THRESHOLD} units.
            </p>
          ) : (
            <div className="mt-3 border border-rule rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Left</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.slug} className="border-t border-rule">
                      <td className="px-4 py-3 text-ink">
                        <Link
                          href="/admin/inventory"
                          className="text-ink no-underline hover:text-terracotta"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-warn-bg text-warn-ink">{p.left_count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
