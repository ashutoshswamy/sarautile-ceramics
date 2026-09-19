import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type OrderRow = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  total: number;
  created_at: string;
};

type Customer = {
  userId: string;
  email: string;
  name: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
};

export default async function AdminCustomersPage(props: PageProps<"/admin/customers">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim().toLowerCase() : "";

  const { data } = await getSupabaseAdmin()
    .from("orders")
    .select("user_id, email, first_name, last_name, total, created_at")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  const byUser = new Map<string, Customer>();
  for (const o of data ?? []) {
    const existing = byUser.get(o.user_id);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent += o.total;
    } else {
      byUser.set(o.user_id, {
        userId: o.user_id,
        email: o.email,
        name: `${o.first_name} ${o.last_name}`,
        orders: 1,
        totalSpent: o.total,
        lastOrder: o.created_at,
      });
    }
  }

  let customers = [...byUser.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  if (query) {
    customers = customers.filter(
      (c) => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
    );
  }

  return (
    <div>
      <h1 className="display-2">Customers</h1>
      <p className="lede text-[0.95rem] mt-2">
        {byUser.size} {byUser.size === 1 ? "person has" : "people have"} ordered.
      </p>

      <form className="mt-6 max-w-[320px]">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name or email…"
          className="field"
        />
      </form>

      {customers.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">Nothing matches.</p>
      ) : (
        <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.userId} className="border-t border-rule">
                  <td className="px-4 py-3 text-ink">
                    {c.name}
                    <br />
                    <span className="text-xs text-ink-faint">{c.email}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <Link
                      href={`/admin/orders?q=${encodeURIComponent(c.email)}`}
                      className="link-arrow"
                    >
                      {c.orders}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">₹{c.totalSpent}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(c.lastOrder).toLocaleDateString()}
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
