import { Image, Page, Text, View } from "@react-pdf/renderer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { PdfOrder } from "./orders";
import { LOGO, RULE, rupees, s } from "./shared";

// ponytail: invoice is rendered on demand from the order row, not stored -
// orders are only inserted after placeOrder verifies the Razorpay payment,
// so every order that exists is a paid one.
export function InvoicePage({ order }: { order: PdfOrder }) {
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

  return (
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
        {order.items.map((item, i) => (
          <View key={i} style={s.line}>
            <Text style={[s.td, s.item]}>{item.name}</Text>
            <Text style={[s.td, s.num]}>{item.qty}</Text>
            <Text style={[s.td, s.num]}>{rupees(item.unit_price)}</Text>
            <Text style={[s.td, s.num]}>{rupees(item.line_total)}</Text>
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
  );
}
