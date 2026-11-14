import { Image, Page, Text, View } from "@react-pdf/renderer";
import { SHIP_FROM, SITE_NAME, SITE_URL } from "@/lib/site";
import type { PdfOrder } from "./orders";
import { LOGO, s } from "./shared";

// A6 box label in the invoice's look: logo + title, kicker headings, soft rules.
export function LabelPage({ order }: { order: PdfOrder }) {
  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const meta: [string, string][] = [
    ["Order ID", `#${order.id}`],
    ["Date", date],
    ["Weight", `${order.kg} kg`],
    ["Payment", "Prepaid"],
  ];

  return (
    <Page size="A6" style={[s.page, { padding: 26 }]}>
      <View style={[s.row, { alignItems: "flex-start" }]}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not <img> */}
        <Image src={LOGO} style={{ width: 96 }} />
        <Text style={[s.bold, { marginLeft: "auto", fontSize: 14 }]}>Shipping label</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={s.kicker}>Ship to</Text>
        <Text style={[s.bold, { fontSize: 13 }]}>
          {order.first_name} {order.last_name}
        </Text>
        <Text>{order.address}</Text>
        <Text>
          {order.city}, {order.state}
        </Text>
        <Text style={[s.bold, { fontSize: 12 }]}>PIN {order.pin}</Text>
        {order.phone && <Text>{order.phone}</Text>}
      </View>

      <View style={{ marginTop: 16 }}>
        {meta.map(([k, v]) => (
          <View key={k} style={[s.row, { marginBottom: 3 }]}>
            <Text style={[s.faint, { width: 60 }]}>{k}</Text>
            <Text>{v}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <View style={s.line}>
          <Text style={[s.th, s.item]}>Item</Text>
          <Text style={[s.th, { width: 30, textAlign: "right" }]}>Qty</Text>
        </View>
        {order.items.map((i, n) => (
          <View key={n} style={s.line}>
            <Text style={[s.td, s.item, { paddingVertical: 4 }]}>{i.name}</Text>
            <Text style={[s.td, { width: 30, textAlign: "right", paddingVertical: 4 }]}>{i.qty}</Text>
          </View>
        ))}
      </View>

      <View style={{ position: "absolute", bottom: 26, left: 26, right: 26 }}>
        <Text style={s.kicker}>From</Text>
        <Text style={s.bold}>{SITE_NAME}</Text>
        {SHIP_FROM.map((l, n) => (
          <Text key={n}>{l}</Text>
        ))}
        <Text style={[s.faint, { fontSize: 8, marginTop: 8 }]}>
          Fragile - handle with care · {SITE_URL.replace("https://", "")}
        </Text>
      </View>
    </Page>
  );
}
