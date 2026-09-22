import Link from "next/link";
import {
  IndianRupee,
  Receipt,
  Clock,
  Users,
  Amphora,
  PackageX,
  Star,
  Mail,
  Plus,
  Percent,
  ChevronRight,
} from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDERS = 6;

type OrderRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total: number;
  status: string;
  user_id: string;
  created_at: string;
};

type ProductRow = { slug: string; name: string; left_count: number };

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-canvas text-ink-soft",
  processing: "bg-warn-bg text-warn-ink",
  shipped: "bg-sage-bg text-sage-ink",
  delivered: "bg-sage-bg text-sage-ink",
  cancelled: "bg-warn-bg text-warn-ink",
};

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

async function getDashboard() {
  const supabase = getSupabaseAdmin();
  const [
    { data: orders },
    { count: productCount },
    { data: products },
    { count: pendingReviews },
    { count: signups },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, first_name, last_name, email, total, status, user_id, created_at")
      .order("created_at", { ascending: false })
      .returns<OrderRow[]>(),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("slug, name, left_count").returns<ProductRow[]>(),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("kiln_signups").select("*", { count: "exact", head: true }),
  ]);

  const allOrders = orders ?? [];
  const lowStock = (products ?? [])
    .filter((p) => p.left_count <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.left_count - b.left_count);

  return {
    revenue: allOrders.reduce((sum, o) => sum + o.total, 0),
    orderCount: allOrders.length,
    pendingCount: allOrders.filter((o) => o.status === "pending").length,
    customerCount: new Set(allOrders.map((o) => o.user_id)).size,
    productCount: productCount ?? 0,
    lowStock,
    pendingReviews: pendingReviews ?? 0,
    signups: signups ?? 0,
    recentOrders: allOrders.slice(0, RECENT_ORDERS),
  };
}

export default async function AdminDashboard() {
  const d = await getDashboard();

  const TILES = [
    { label: "Total revenue", value: rupees(d.revenue), Icon: IndianRupee },
    { label: "Orders placed", value: d.orderCount, Icon: Receipt },
    { label: "Awaiting action", value: d.pendingCount, Icon: Clock },
    { label: "Customers", value: d.customerCount, Icon: Users },
    { label: "Products in catalog", value: d.productCount, Icon: Amphora },
    { label: "Low / out of stock", value: d.lowStock.length, Icon: PackageX },
  ];

  const ATTENTION = [
    d.pendingCount > 0 && {
      href: "/admin/orders?status=pending",
      label: `${d.pendingCount} order${d.pendingCount === 1 ? "" : "s"} awaiting processing`,
      Icon: Clock,
    },
    d.lowStock.length > 0 && {
      href: "/admin/inventory",
      label: `${d.lowStock.length} product${d.lowStock.length === 1 ? "" : "s"} low on stock`,
      Icon: PackageX,
    },
    d.pendingReviews > 0 && {
      href: "/admin/reviews",
      label: `${d.pendingReviews} review${d.pendingReviews === 1 ? "" : "s"} to approve`,
      Icon: Star,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Clock }[];

  const QUICK_ACTIONS = [
    { href: "/admin/products/new", label: "Add product", Icon: Plus },
    { href: "/admin/discounts", label: "New discount code", Icon: Percent },
    { href: "/admin/kiln-signups", label: `Kiln signups (${d.signups})`, Icon: Mail },
  ];

  return (
    <div>
      <h1 className="display-2">Dashboard</h1>
      <p className="lede text-[0.95rem] mt-2">The whole shop, at a glance.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
        {TILES.map((t) => (
          <div key={t.label} className="card p-5">
            <t.Icon size={18} strokeWidth={1.6} className="text-terracotta" />
            <p className="text-2xl font-medium text-ink mt-3">{t.value}</p>
            <p className="text-xs text-ink-soft mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 mt-10">
        <div>
          <div className="flex items-center">
            <span className="kicker">Recent orders</span>
            <Link
              href="/admin/orders"
              className="link-arrow ml-auto text-xs no-underline"
            >
              View all <ChevronRight size={13} strokeWidth={1.8} aria-hidden />
            </Link>
          </div>

          {d.recentOrders.length === 0 ? (
            <p className="text-sm text-ink-faint mt-4">No orders yet.</p>
          ) : (
            <div className="mt-3 border border-rule rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-rule">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-ink no-underline hover:text-terracotta"
                        >
                          #{o.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {o.first_name} {o.last_name}
                        <br />
                        <span className="text-xs text-ink-faint">{o.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${STATUS_STYLE[o.status] ?? "bg-canvas text-ink-soft"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{rupees(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <span className="kicker">Needs attention</span>
            {ATTENTION.length === 0 ? (
              <p className="text-sm text-ink-faint mt-3">Nothing waiting on you.</p>
            ) : (
              <div className="flex flex-col gap-2 mt-3">
                {ATTENTION.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="card flex items-center gap-3 p-3.5 no-underline hover:border-rule-strong"
                  >
                    <a.Icon size={16} strokeWidth={1.7} className="shrink-0 text-terracotta" />
                    <span className="text-sm text-ink">{a.label}</span>
                    <ChevronRight size={14} strokeWidth={1.8} className="ml-auto shrink-0 text-ink-faint" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="kicker">Quick actions</span>
            <div className="flex flex-col gap-2 mt-3">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="card flex items-center gap-3 p-3.5 no-underline hover:border-rule-strong"
                >
                  <a.Icon size={16} strokeWidth={1.7} className="shrink-0 text-ink-faint" />
                  <span className="text-sm text-ink">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
