import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type OrderRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total: number;
  created_at: string;
};

export default async function AdminOrdersPage() {
  const { data: orders } = await getSupabaseAdmin()
    .from("orders")
    .select("id, first_name, last_name, email, total, created_at")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  return (
    <div>
      <h1 className="display-2">Orders</h1>
      <p className="lede text-[0.95rem] mt-2">{orders?.length ?? 0} placed.</p>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">Nothing yet.</p>
      ) : (
        <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-rule">
                  <td className="px-4 py-3 font-medium text-ink">#{o.id}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {o.first_name} {o.last_name}
                    <br />
                    <span className="text-xs text-ink-faint">{o.email}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">₹{o.total}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="link-arrow justify-end">
                      View <ChevronRight size={14} strokeWidth={1.8} aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
