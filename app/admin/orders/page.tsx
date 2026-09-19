import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type OrderRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-canvas text-ink-soft",
  processing: "bg-warn-bg text-warn-ink",
  shipped: "bg-sage-bg text-sage-ink",
  delivered: "bg-sage-bg text-sage-ink",
  cancelled: "bg-warn-bg text-warn-ink",
};

export default async function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  const searchParams = await props.searchParams;
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const query = typeof searchParams.q === "string" ? searchParams.q.trim().toLowerCase() : "";

  const { data } = await getSupabaseAdmin()
    .from("orders")
    .select("id, first_name, last_name, email, total, status, created_at")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  let orders = data ?? [];
  if (status) orders = orders.filter((o) => o.status === status);
  if (query) {
    orders = orders.filter(
      (o) =>
        `${o.first_name} ${o.last_name}`.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
    );
  }

  return (
    <div>
      <h1 className="display-2">Orders</h1>
      <p className="lede text-[0.95rem] mt-2">{data?.length ?? 0} placed.</p>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <form className="flex-1 min-w-[200px]">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            className="field"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`px-3 py-1.5 rounded-full border text-xs no-underline transition-colors ${
              !status ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft hover:border-rule-strong"
            }`}
          >
            All
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`px-3 py-1.5 rounded-full border text-xs capitalize no-underline transition-colors ${
                status === s ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft hover:border-rule-strong"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">Nothing matches.</p>
      ) : (
        <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Status</th>
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
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${STATUS_STYLE[o.status] ?? "bg-canvas text-ink-soft"}`}>
                      {o.status}
                    </span>
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
