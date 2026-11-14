import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SHIP_FROM, SITE_NAME } from "@/lib/site";
import type { PdfOrder } from "./orders";
import { FAINT, INK } from "./shared";

const s = StyleSheet.create({
  page: { fontFamily: "DM Sans", color: INK, padding: 14, fontSize: 10 },
  box: { borderWidth: 1.5, borderColor: INK, padding: 14, flexGrow: 1 },
  kicker: { fontSize: 8, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  bold: { fontWeight: 600 },
  rule: { borderTopWidth: 1, borderTopColor: INK, marginVertical: 10 },
  row: { flexDirection: "row" },
});

// A6 sticker for the box - ship-to up top, order summary, ship-from at the bottom.
export function LabelPage({ order }: { order: PdfOrder }) {
  const units = order.items.reduce((n, i) => n + i.qty, 0);
  return (
    <Page size="A6" style={s.page}>
      <View style={s.box}>
        <Text style={s.kicker}>Ship to</Text>
        <Text style={[s.bold, { fontSize: 15 }]}>
          {order.first_name} {order.last_name}
        </Text>
        <Text style={{ marginTop: 4 }}>{order.address}</Text>
        <Text>{order.city}, {order.state}</Text>
        <Text style={[s.bold, { fontSize: 18, marginTop: 4 }]}>PIN {order.pin}</Text>
        {order.phone && <Text style={{ marginTop: 4 }}>Phone: {order.phone}</Text>}

        <View style={s.rule} />

        <View style={s.row}>
          <Text style={[s.bold, { fontSize: 12 }]}>Order #{order.id}</Text>
          <Text style={{ marginLeft: "auto" }}>
            {units} item{units === 1 ? "" : "s"} · {order.kg} kg · Prepaid
          </Text>
        </View>
        <View style={{ marginTop: 6 }}>
          {order.items.map((i, n) => (
            <Text key={n} style={{ marginBottom: 2 }}>
              {i.qty} × {i.name}
            </Text>
          ))}
        </View>

        <View style={{ marginTop: "auto" }}>
          <Text style={[s.bold, { fontSize: 11, textAlign: "center", marginBottom: 8 }]}>
            FRAGILE · HANDLE WITH CARE
          </Text>
          <View style={{ borderTopWidth: 1, borderTopColor: INK, paddingTop: 6 }}>
            <Text style={s.kicker}>From</Text>
            <Text style={s.bold}>{SITE_NAME}</Text>
            {SHIP_FROM.map((l, n) => (
              <Text key={n}>{l}</Text>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
}
