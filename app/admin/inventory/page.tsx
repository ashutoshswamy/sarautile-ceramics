import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import { updateStock } from "./actions";

const LOW_STOCK_THRESHOLD = 5;
const HISTORY_LIMIT = 100;

type ProductRow = {
  slug: string;
  name: string;
  left_count: number;
  category: { name: string } | null;
};

type HistoryRow = {
  id: number;
  product_slug: string;
  product_name: string;
  old_count: number | null;
  new_count: number;
  changed_by: string | null;
  created_at: string;
};

export default async function AdminInventoryPage() {
  const supabase = getSupabaseAdmin();
  const [{ data }, { data: historyData }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, name, left_count, category:categories(name)")
      .order("left_count", { ascending: true })
      .returns<ProductRow[]>(),
    supabase
      .from("inventory_history")
      .select("id, product_slug, product_name, old_count, new_count, changed_by, created_at")
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT)
      .returns<HistoryRow[]>(),
  ]);

  const products = data ?? [];
  const history = historyData ?? [];
  const totalUnits = products.reduce((sum, p) => sum + p.left_count, 0);
  const outOfStock = products.filter((p) => p.left_count === 0).length;
  const lowStock = products.filter(
    (p) => p.left_count > 0 && p.left_count <= LOW_STOCK_THRESHOLD
  ).length;

  const TILES = [
    { label: "Products tracked", value: products.length },
    { label: "Units in stock", value: totalUnits },
    { label: "Low stock", value: lowStock },
    { label: "Out of stock", value: outOfStock },
  ];

  return (
    <div>
      <h1 className="display-2">Inventory</h1>
      <p className="lede text-[0.95rem] mt-2">
        Stock on hand per product, lowest first. Edit counts below and save.
      </p>

      <div className="grid sm:grid-cols-4 gap-5 mt-8">
        {TILES.map((t) => (
          <div key={t.label} className="card p-5">
            <p className="text-2xl font-medium text-ink">{t.value}</p>
            <p className="text-xs text-ink-soft mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">No products in the catalog yet.</p>
      ) : (
        <form action={updateStock} className="mt-8">
          <div className="border border-rule rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const low = p.left_count <= LOW_STOCK_THRESHOLD;
                  const status = p.left_count === 0 ? "Out of stock" : low ? "Low" : "In stock";
                  return (
                    <tr key={p.slug} className="border-t border-rule">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${p.slug}`}
                          className="text-ink no-underline hover:text-terracotta"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${low ? "bg-warn-bg text-warn-ink" : "bg-sage-bg text-sage-ink"}`}
                        >
                          {low && <AlertTriangle size={11} strokeWidth={2} aria-hidden />}
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name={`stock_${p.slug}`}
                          defaultValue={p.left_count}
                          min={0}
                          className="field w-24"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </form>
      )}

      <section className="mt-12 pt-8 border-t border-rule">
        <h2 className="display-3 text-[1.15rem]">Stock history</h2>
        <p className="text-sm text-ink-soft mt-1.5">
          Every stock change - manual edits, new products, and checkout sales. Latest{" "}
          {HISTORY_LIMIT}.
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-ink-faint mt-5">No stock changes recorded yet.</p>
        ) : (
          <div className="border border-rule rounded-2xl overflow-x-auto mt-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                  <th className="px-4 py-3 font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => {
                  const delta = h.new_count - (h.old_count ?? 0);
                  return (
                    <tr key={h.id} className="border-t border-rule">
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                        {new Date(h.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })}
                      </td>
                      <td className="px-4 py-3 text-ink">{h.product_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {h.old_count === null ? (
                          <span className="text-ink-soft">Created with {h.new_count}</span>
                        ) : (
                          <>
                            <span className="text-ink-soft">
                              {h.old_count} → {h.new_count}
                            </span>{" "}
                            <span className={delta < 0 ? "text-warn-ink" : "text-sage-ink"}>
                              ({delta > 0 ? "+" : ""}
                              {delta})
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{h.changed_by ?? "System"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
