import path from "path";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Order = {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  discount_code: string | null;
  discount_amount: number;
  subtotal: number;
  total: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  created_at: string;
};

const root = process.cwd();
Font.register({
  family: "DM Sans",
  fonts: [
    { src: path.join(root, "lib/fonts/DMSans-Regular.ttf") },
    { src: path.join(root, "lib/fonts/DMSans-SemiBold.ttf"), fontWeight: 600 },
  ],
});
const LOGO = path.join(root, "public/logo-nobg.png");

const INK = "#33243a";
const FAINT = "#8a7d8f";
const RULE = "#e7ddd6";

const s = StyleSheet.create({
  page: { fontFamily: "DM Sans", fontSize: 10, color: INK, padding: 44 },
  row: { flexDirection: "row" },
  faint: { color: FAINT },
  kicker: { fontSize: 8, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  bold: { fontWeight: 600 },
  th: { fontSize: 8, color: FAINT, textTransform: "uppercase", letterSpacing: 1, paddingVertical: 6 },
  td: { paddingVertical: 7 },
  line: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: RULE },
  item: { flex: 1 },
  num: { width: 70, textAlign: "right" },
});

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ponytail: invoice is rendered on demand from the order row, not stored -
// orders are only inserted after placeOrder verifies the Razorpay payment,
// so every order that exists is a paid one.
export async function GET(_req: Request, ctx: RouteContext<"/invoice/[id]">) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) redirect(`/signin?redirect_url=/invoice/${id}`);

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .returns<Order[]>()
    .maybeSingle();

  const isAdmin = user.publicMetadata?.role === "admin";
  if (!order || !order.razorpay_payment_id || (order.user_id !== user.id && !isAdmin)) {
    return new Response("Not found", { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_slug, qty, unit_price")
    .eq("order_id", order.id)
    .returns<{ product_slug: string; qty: number; unit_price: number }[]>();
  const { data: products } = await supabase
    .from("products")
    .select("slug, name")
    .in("slug", (items ?? []).map((i) => i.product_slug));
  const nameBySlug = new Map((products ?? []).map((p) => [p.slug, p.name as string]));

  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const meta: [string, string][] = [
    ["Order ID", `#${order.id}`],
    ["Razorpay order", order.razorpay_order_id],
    ["Payment ID", order.razorpay_payment_id],
    ["Date", date],
    ["Status", "Paid"],
  ];

  const pdf = await renderToBuffer(
    <Document title={`Invoice #${order.id}`} author={SITE_NAME}>
      <Page size="A4" style={s.page}>
        <View style={[s.row, { alignItems: "flex-start" }]}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not <img> */}
          <Image src={LOGO} style={{ width: 150 }} />
          <Text style={[s.bold, { marginLeft: "auto", fontSize: 22 }]}>Invoice</Text>
        </View>

        <View style={[s.row, { marginTop: 32 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>Billed to</Text>
            <Text>
              {order.first_name} {order.last_name}
            </Text>
            <Text>{order.address}</Text>
            <Text>
              {order.city}, {order.state} {order.pin}
            </Text>
            <Text>{order.email}</Text>
          </View>
          <View>
            {meta.map(([k, v]) => (
              <View key={k} style={[s.row, { marginBottom: 3 }]}>
                <Text style={[s.faint, { width: 90 }]}>{k}</Text>
                <Text>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 32 }}>
          <View style={s.line}>
            <Text style={[s.th, s.item]}>Item</Text>
            <Text style={[s.th, s.num]}>Qty</Text>
            <Text style={[s.th, s.num]}>Price</Text>
            <Text style={[s.th, s.num]}>Amount</Text>
          </View>
          {(items ?? []).map((item, i) => (
            <View key={i} style={s.line}>
              <Text style={[s.td, s.item]}>{nameBySlug.get(item.product_slug) ?? item.product_slug}</Text>
              <Text style={[s.td, s.num]}>{item.qty}</Text>
              <Text style={[s.td, s.num]}>{rupees(item.unit_price)}</Text>
              <Text style={[s.td, s.num]}>{rupees(item.unit_price * item.qty)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginLeft: "auto", width: 220, marginTop: 12 }}>
          <View style={[s.row, { marginBottom: 4 }]}>
            <Text style={s.faint}>Subtotal</Text>
            <Text style={{ marginLeft: "auto" }}>{rupees(order.subtotal)}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={[s.row, { marginBottom: 4 }]}>
              <Text style={s.faint}>
                Discount{order.discount_code ? ` (${order.discount_code})` : ""}
              </Text>
              <Text style={{ marginLeft: "auto" }}>-{rupees(order.discount_amount)}</Text>
            </View>
          )}
          <View style={[s.row, s.bold, { borderTopWidth: 1, borderTopColor: RULE, paddingTop: 6, fontSize: 12 }]}>
            <Text>Total paid</Text>
            <Text style={{ marginLeft: "auto" }}>{rupees(order.total)}</Text>
          </View>
        </View>

        <Text style={[s.faint, { position: "absolute", bottom: 36, left: 44, fontSize: 8 }]}>
          Thank you for supporting handmade. {SITE_NAME} · {SITE_URL.replace("https://", "")}
        </Text>
      </Page>
    </Document>
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sarautile-invoice-${order.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
