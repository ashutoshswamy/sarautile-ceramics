"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Download, MapPin,Package, Plus, Star, Trash2, User, X } from "lucide-react";
import { useAuthedSupabase } from "@/lib/useAuthedSupabase";

type OrderRow = {
  id: number;
  status: string;
  subtotal: number;
  discount_code: string | null;
  discount_amount: number;
  total: number;
  razorpay_payment_id: string;
  created_at: string;
};

type OrderItemRow = {
  order_id: number;
  product_slug: string;
  qty: number;
  unit_price: number;
};

type AddressRow = {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  is_default: boolean;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-canvas text-ink-soft",
  processing: "bg-warn-bg text-warn-ink",
  shipped: "bg-sage-bg text-sage-ink",
  delivered: "bg-sage-bg text-sage-ink",
  cancelled: "bg-warn-bg text-warn-ink",
};

const EMPTY_ADDRESS = {
  label: "Home",
  first_name: "",
  last_name: "",
  address: "",
  city: "",
  state: "",
  pin: "",
};

function OrdersTab({
  orders,
  itemsByOrder,
}: {
  orders: OrderRow[];
  itemsByOrder: Map<number, OrderItemRow[]>;
}) {
  if (orders.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-start gap-3">
        <Package size={22} strokeWidth={1.6} className="text-terracotta" />
        <p className="lede text-[0.95rem]">No orders yet.</p>
        <Link href="/products" className="btn btn-primary mt-1">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((o) => (
        <div key={o.id} className="card p-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium">Order #{o.id}</span>
            <span className={`badge capitalize ${STATUS_STYLE[o.status] ?? "bg-canvas text-ink-soft"}`}>
              {o.status}
            </span>
            <span className="text-xs text-ink-faint ml-auto">
              {new Date(o.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            {(itemsByOrder.get(o.id) ?? []).map((item, i) => (
              <div key={i} className="flex text-sm text-ink-soft">
                <span>
                  {item.product_slug} ×{item.qty}
                </span>
                <span className="ml-auto">₹{item.unit_price * item.qty}</span>
              </div>
            ))}
          </div>

          <div className="divider my-3.5" />
          <div className="flex text-sm text-ink-soft">
            <span>Subtotal</span>
            <span className="ml-auto">₹{o.subtotal}</span>
          </div>
          {o.discount_amount > 0 && (
            <div className="flex text-sm text-sage-ink mt-1">
              <span>Discount{o.discount_code ? ` (${o.discount_code})` : ""}</span>
              <span className="ml-auto">-₹{o.discount_amount}</span>
            </div>
          )}
          <div className="flex text-base font-medium mt-1.5">
            <span>Total paid</span>
            <span className="ml-auto">₹{o.total}</span>
          </div>
          <div className="flex items-center mt-2">
            <p className="text-xs text-ink-faint font-mono">{o.razorpay_payment_id}</p>
            <a href={`/invoice/${o.id}`} download className="link-arrow ml-auto text-xs">
              <Download size={13} strokeWidth={1.8} aria-hidden />
              Invoice
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({
  addresses,
  onSave,
  onDelete,
  onMakeDefault,
}: {
  addresses: AddressRow[];
  onSave: (id: number | null, values: typeof EMPTY_ADDRESS) => Promise<void>;
  onDelete: (id: number) => void;
  onMakeDefault: (id: number) => void;
}) {
  const [editingId, setEditingId] = useState<number | null | "new">(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  function startEdit(a: AddressRow) {
    setForm({
      label: a.label,
      first_name: a.first_name,
      last_name: a.last_name,
      address: a.address,
      city: a.city,
      state: a.state,
      pin: a.pin,
    });
    setEditingId(a.id);
  }

  function startNew() {
    setForm(EMPTY_ADDRESS);
    setEditingId("new");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(editingId === "new" ? null : editingId, form);
    setSaving(false);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((a) => (
        <div key={a.id} className="card p-5">
          {editingId === a.id ? (
            <AddressForm form={form} setForm={setForm} onSubmit={submit} onCancel={() => setEditingId(null)} saving={saving} />
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{a.label}</span>
                {a.is_default && <span className="badge bg-sage-bg text-sage-ink">Default</span>}
                <div className="ml-auto flex items-center gap-3">
                  {!a.is_default && (
                    <button
                      onClick={() => onMakeDefault(a.id)}
                      className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-ink"
                    >
                      <Star size={13} strokeWidth={1.8} />
                      Make default
                    </button>
                  )}
                  <button onClick={() => startEdit(a)} className="text-xs text-ink-faint hover:text-ink">
                    Edit
                  </button>
                  <button onClick={() => onDelete(a.id)} className="text-ink-faint hover:text-terracotta">
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                {a.first_name} {a.last_name}
                <br />
                {a.address}
                <br />
                {a.city}, {a.state} {a.pin}
              </p>
            </>
          )}
        </div>
      ))}

      {editingId === "new" ? (
        <div className="card p-5">
          <AddressForm form={form} setForm={setForm} onSubmit={submit} onCancel={() => setEditingId(null)} saving={saving} />
        </div>
      ) : (
        <button onClick={startNew} className="btn btn-ghost self-start">
          <Plus size={15} strokeWidth={1.8} />
          Add address
        </button>
      )}
    </div>
  );
}

function AddressForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
}: {
  form: typeof EMPTY_ADDRESS;
  setForm: (f: typeof EMPTY_ADDRESS) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const set = (key: keyof typeof EMPTY_ADDRESS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center">
        <span className="text-sm font-medium">{form.label ? "Edit address" : "New address"}</span>
        <button type="button" onClick={onCancel} aria-label="Cancel" className="ml-auto text-ink-faint hover:text-ink">
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 mt-4">
        <label className="field-label col-span-2">
          Label
          <input value={form.label} onChange={set("label")} required placeholder="Home, Work…" className="field" />
        </label>
        <label className="field-label">
          First name
          <input value={form.first_name} onChange={set("first_name")} required className="field" />
        </label>
        <label className="field-label">
          Last name
          <input value={form.last_name} onChange={set("last_name")} required className="field" />
        </label>
        <label className="field-label col-span-2">
          Address
          <input value={form.address} onChange={set("address")} required className="field" />
        </label>
        <label className="field-label">
          City
          <input value={form.city} onChange={set("city")} required className="field" />
        </label>
        <label className="field-label">
          State
          <input value={form.state} onChange={set("state")} required className="field" />
        </label>
        <label className="field-label col-span-2">
          PIN code
          <input value={form.pin} onChange={set("pin")} required className="field" />
        </label>
      </div>
      <button type="submit" disabled={saving} className="btn btn-primary mt-4 disabled:opacity-60">
        {saving ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const supabase = useAuthedSupabase();
  const [tab, setTab] = useState<"orders" | "addresses">("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Map<number, OrderItemRow[]>>(new Map());
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: orderRows }, { data: addressRows }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, status, subtotal, discount_code, discount_amount, total, razorpay_payment_id, created_at")
          .order("created_at", { ascending: false })
          .returns<OrderRow[]>(),
        supabase
          .from("addresses")
          .select("id, label, first_name, last_name, address, city, state, pin, is_default")
          .order("is_default", { ascending: false })
          .returns<AddressRow[]>(),
      ]);
      if (cancelled) return;

      const orderIds = (orderRows ?? []).map((o) => o.id);
      const grouped = new Map<number, OrderItemRow[]>();
      if (orderIds.length > 0) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("order_id, product_slug, qty, unit_price")
          .in("order_id", orderIds)
          .returns<OrderItemRow[]>();
        for (const item of itemRows ?? []) {
          grouped.set(item.order_id, [...(grouped.get(item.order_id) ?? []), item]);
        }
      }
      if (cancelled) return;

      setOrders(orderRows ?? []);
      setItemsByOrder(grouped);
      setAddresses(addressRows ?? []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  async function saveAddress(id: number | null, values: typeof EMPTY_ADDRESS) {
    if (!user) return;
    if (id == null) {
      const { data } = await supabase
        .from("addresses")
        .insert({ user_id: user.id, ...values, is_default: addresses.length === 0 })
        .select("id, label, first_name, last_name, address, city, state, pin, is_default")
        .returns<AddressRow[]>()
        .single();
      if (data) setAddresses((prev) => [...prev, data]);
    } else {
      await supabase.from("addresses").update(values).eq("id", id);
      setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...values } : a)));
    }
  }

  async function deleteAddress(id: number) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("addresses").delete().eq("id", id);
  }

  async function makeDefault(id: number) {
    if (!user) return;
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  }

  if (!user) {
    return (
      <div className="container-x section-tight max-w-[520px] text-center flex flex-col items-center gap-4">
        <User size={22} strokeWidth={1.6} className="text-terracotta" />
        <h1 className="display-2">Sign in to see your profile</h1>
        <p className="lede text-[0.95rem]">Your orders and addresses live on your account.</p>
        <Link href="/signin?redirect_url=/profile" className="btn btn-primary mt-2">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x section-tight max-w-[720px]">
      <h1 className="display-2">
        {user.firstName ? `Hi, ${user.firstName}` : "Your account"}
      </h1>
      <p className="lede text-[0.95rem] mt-2">{user.primaryEmailAddress?.emailAddress}</p>

      <div className="flex items-center gap-2 mt-7 border-b border-rule">
        <button
          onClick={() => setTab("orders")}
          className={`inline-flex items-center gap-1.5 px-1 pb-3 text-sm border-b-2 -mb-px ${
            tab === "orders" ? "border-ink text-ink" : "border-transparent text-ink-faint"
          }`}
        >
          <Package size={15} strokeWidth={1.8} />
          Orders
        </button>
        <button
          onClick={() => setTab("addresses")}
          className={`inline-flex items-center gap-1.5 px-3 pb-3 text-sm border-b-2 -mb-px ${
            tab === "addresses" ? "border-ink text-ink" : "border-transparent text-ink-faint"
          }`}
        >
          <MapPin size={15} strokeWidth={1.8} />
          Addresses
        </button>
      </div>

      <div className="mt-6">
        {!loaded ? (
          <p className="text-sm text-ink-faint">Loading…</p>
        ) : tab === "orders" ? (
          <OrdersTab orders={orders} itemsByOrder={itemsByOrder} />
        ) : (
          <AddressesTab
            addresses={addresses}
            onSave={saveAddress}
            onDelete={deleteAddress}
            onMakeDefault={makeDefault}
          />
        )}
      </div>
    </div>
  );
}
