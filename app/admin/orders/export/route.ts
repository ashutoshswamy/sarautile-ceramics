import { requireSection } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// ponytail: no Shiprocket API hookup - admin downloads this CSV and uploads it
// in Shiprocket's bulk order import. HEADERS is the exact header row of
// Shiprocket's orders.csv template (since deleted); unset columns stay blank.
// Package size is a flat guess; edit PKG_CM if boxes differ.
const HEADERS = [
  "*Order Id",
  "Order Date as dd-mm-yyyy hh:MM",
  "*Channel",
  "*Payment Method(COD/Prepaid)",
  "*Customer First Name",
  "Customer Last Name",
  "Email (Optional)",
  "*Customer Mobile",
  "Customer Alternate Mobile",
  "*Shipping Address Line 1",
  "Shipping Address Line 2",
  "*Shipping Address Country",
  "*Shipping Address State",
  "*Shipping Address City",
  "*Shipping Address Postcode",
  "Billing Address Line 1",
  "Billing Address Line 2",
  "Billing Address Country",
  "Billing Address State",
  "Billing Address City",
  "Billing Address Postcode",
  "*Master SKU",
  "*Product Name",
  "*Product Quantity",
  "Tax %",
  "*Selling Price(Per Unit Item, Inclusive of Tax)",
  "Discount(Per Unit Item)",
  "Shipping Charges(Per Order)",
  "COD Charges(Per Order)",
  "Gift Wrap Charges(Per Order)",
  "Total Discount (Per Order)",
  "*Partial COD (Yes/No)",
  "Paid Amount (Rs.)",
  "*Length (cm)",
  "*Breadth (cm)",
  "*Height (cm)",
  "*Weight Of Shipment(kg)",
  "Send Notification(True/False)",
  "Comment",
  "HSN Code",
  "Location Id",
  "Reseller Name",
  "Company Name",
  "latitude",
  "longitude",
  "Verified Order",
  "Is documents",
  "Order Type",
  "Order tag",
  "Fulfillment Tat",
  "Appointment Date",
  "Marketplace Name",
  "Po Expiry Date",
  "Po Units",
  "Advance AWB"
];
const PKG_CM = [20, 20, 15];
const DEFAULT_KG = 0.5;

// "450g" / "1.2 kg" -> kg; anything unparseable -> DEFAULT_KG
function kg(text: string | null) {
  const m = text?.match(/([\d.]+)\s*(kg|g)?/i);
  if (!m) return DEFAULT_KG;
  const n = parseFloat(m[1]);
  return m[2]?.toLowerCase() === "kg" ? n : n / 1000 || DEFAULT_KG;
}

// quotes + neutralises spreadsheet formulas in customer-typed text
const cell = (v: string | number) => {
  const s = String(v).replace(/^[=+\-@\t\r]/, "'$&");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  await requireSection("orders");
  const supabase = getSupabaseAdmin();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, first_name, last_name, email, address, city, state, pin, phone, discount_amount, created_at")
    .in("status", ["pending", "processing"])
    .order("id");
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_slug, qty, line_total")
    .in("order_id", (orders ?? []).map((o) => o.id));
  const { data: products } = await supabase
    .from("products")
    .select("slug, name, weight")
    .in("slug", [...new Set((items ?? []).map((i) => i.product_slug))]);
  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));

  const rows: string[][] = [];
  for (const o of orders ?? []) {
    const mine = (items ?? []).filter((i) => i.order_id === o.id);
    const totalKg = mine.reduce((sum, i) => sum + kg(bySlug.get(i.product_slug)?.weight ?? null) * i.qty, 0);
    const [d, t] = new Date(o.created_at)
      .toLocaleString("en-GB", { timeZone: "Asia/Kolkata", hour12: false })
      .split(", ");
    mine.forEach((i, n) => {
      const v: Record<string, string | number> = {
        "*Order Id": o.id,
        "Order Date as dd-mm-yyyy hh:MM": `${d.replaceAll("/", "-")} ${t.slice(0, 5)}`,
        "*Channel": "Custom",
        "*Payment Method(COD/Prepaid)": "Prepaid",
        "*Customer First Name": o.first_name,
        "Customer Last Name": o.last_name,
        "Email (Optional)": o.email,
        "*Customer Mobile": o.phone ?? "",
        "*Shipping Address Line 1": o.address,
        "*Shipping Address Country": "India",
        "*Shipping Address State": o.state,
        "*Shipping Address City": o.city,
        "*Shipping Address Postcode": o.pin,
        "*Master SKU": i.product_slug,
        "*Product Name": bySlug.get(i.product_slug)?.name ?? i.product_slug,
        "*Product Quantity": i.qty,
        "*Selling Price(Per Unit Item, Inclusive of Tax)": Math.round(i.line_total / i.qty),
        // per-order field: only on the order's first row so it isn't counted twice
        "Total Discount (Per Order)": n === 0 && o.discount_amount ? o.discount_amount : "",
        "*Partial COD (Yes/No)": "no",
        "*Length (cm)": PKG_CM[0],
        "*Breadth (cm)": PKG_CM[1],
        "*Height (cm)": PKG_CM[2],
        "*Weight Of Shipment(kg)": Math.round(totalKg * 100) / 100,
      };
      rows.push(HEADERS.map((k) => String(v[k] ?? "")));
    });
  }

  const csv = [HEADERS, ...rows].map((r) => r.map(cell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shiprocket-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
