import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import { updateOrderStatus } from "../actions";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

type Order = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  status: string;
  discount_code: string | null;
  discount_amount: number;
  subtotal: number;
  total: number;
  razorpay_payment_id: string;
  created_at: string;
};

type OrderItem = {
  product_slug: string;
  qty: number;
  unit_price: number;
};

export default async function AdminOrderDetailPage(
  props: PageProps<"/admin/orders/[id]">
) {
  const { id } = await props.params;
  const supabase = getSupabaseAdmin();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).returns<Order[]>().single(),
    supabase
      .from("order_items")
      .select("product_slug, qty, unit_price")
      .eq("order_id", id)
      .returns<OrderItem[]>(),
  ]);

  if (!order) notFound();

  return (
    <div className="max-w-[640px]">
      <nav className="flex items-center gap-1 text-xs text-ink-faint mb-4">
        <Link href="/admin/orders" className="text-ink-faint no-underline hover:text-ink">
          Orders
        </Link>
        <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
        <span className="text-ink-soft">#{order.id}</span>
      </nav>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="display-2">Order #{order.id}</h1>
        <span className="badge capitalize">{order.status}</span>
      </div>
      <p className="text-sm text-ink-faint mt-1">
        {new Date(order.created_at).toLocaleString()}
      </p>

      <form
        action={updateOrderStatus.bind(null, order.id)}
        className="flex items-center gap-3 mt-5"
      >
        <select name="status" defaultValue={order.status} className="field w-auto">
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
        <SubmitButton>Update status</SubmitButton>
      </form>

      <div className="grid sm:grid-cols-2 gap-8 mt-8">
        <div>
          <span className="kicker">Ship to</span>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            {order.first_name} {order.last_name}
            <br />
            {order.address}
            <br />
            {order.city}, {order.state} {order.pin}
            <br />
            {order.email}
          </p>
        </div>
        <div>
          <span className="kicker">Payment</span>
          <p className="text-sm text-ink mt-2 font-mono text-xs">{order.razorpay_payment_id}</p>
          <a href={`/invoice/${order.id}`} download className="link-arrow inline-flex mt-3 text-sm">
            <FileText size={14} strokeWidth={1.8} aria-hidden /> Download invoice
          </a>
        </div>
      </div>

      <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item, i) => (
              <tr key={i} className="border-t border-rule">
                <td className="px-4 py-3 text-ink">{item.product_slug}</td>
                <td className="px-4 py-3 text-ink-soft">×{item.qty}</td>
                <td className="px-4 py-3 text-ink-soft">₹{item.unit_price * item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-rule px-4 py-3 flex flex-col gap-1 text-sm text-ink-soft">
          <div className="flex">
            <span>Subtotal</span>
            <span className="ml-auto">₹{order.subtotal}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex">
              <span>Discount {order.discount_code ? `(${order.discount_code})` : ""}</span>
              <span className="ml-auto">-₹{order.discount_amount}</span>
            </div>
          )}
          <div className="flex text-base font-medium text-ink">
            <span>Total</span>
            <span className="ml-auto">₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
