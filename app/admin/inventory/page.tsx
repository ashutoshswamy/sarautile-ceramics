import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import { updateStock } from "./actions";

const LOW_STOCK_THRESHOLD = 5;

type ProductRow = {
  slug: string;
  name: string;
  left_count: number;
  category: { name: string } | null;
};

export default async function AdminInventoryPage() {
  const { data } = await getSupabaseAdmin()
    .from("products")
    .select("slug, name, left_count, category:categories(name)")
    .order("left_count", { ascending: true })
    .returns<ProductRow[]>();

  const products = data ?? [];
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
    </div>
  );
}
