import Link from "next/link";
import { Amphora, Receipt, Mail, ArrowRight } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function getStats() {
  const supabase = getSupabaseAdmin();
  const [products, orders, signups] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("kiln_signups").select("*", { count: "exact", head: true }),
  ]);
  return {
    products: products.count ?? 0,
    orders: orders.count ?? 0,
    signups: signups.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const TILES = [
    { href: "/admin/products", label: "Products in catalog", value: stats.products, Icon: Amphora },
    { href: "/admin/orders", label: "Orders placed", value: stats.orders, Icon: Receipt },
    { href: "/admin/kiln-signups", label: "Kiln signups", value: stats.signups, Icon: Mail },
  ];

  return (
    <div>
      <h1 className="display-2">Dashboard</h1>
      <p className="lede text-[0.95rem] mt-2">The whole shop, at a glance.</p>

      <div className="grid sm:grid-cols-3 gap-5 mt-8">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card p-6 no-underline transition-colors hover:border-rule-strong"
          >
            <t.Icon size={20} strokeWidth={1.6} className="text-terracotta" />
            <p className="text-3xl font-medium text-ink mt-4">{t.value}</p>
            <p className="text-sm text-ink-soft mt-1 flex items-center gap-1.5">
              {t.label}
              <ArrowRight size={13} strokeWidth={1.8} aria-hidden />
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
