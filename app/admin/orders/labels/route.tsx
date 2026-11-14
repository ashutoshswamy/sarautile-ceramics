import { Document, renderToBuffer } from "@react-pdf/renderer";
import { requireSection } from "@/lib/adminAuth";
import { LabelPage } from "@/lib/pdf/label";
import { filterFromRequest, loadPdfOrders } from "@/lib/pdf/orders";
import "@/lib/pdf/shared";

// ?id=1&id=2 for chosen orders; no ids = every pending/processing order.
// Inline (not attachment) so the browser's PDF viewer opens it ready to print.
export async function GET(req: Request) {
  await requireSection("orders");
  const orders = await loadPdfOrders(filterFromRequest(req));
  if (orders.length === 0) return new Response("No orders to print.", { status: 404 });

  const pdf = await renderToBuffer(
    <Document title="Shipping labels">
      {orders.map((o) => (
        <LabelPage key={o.id} order={o} />
      ))}
    </Document>
  );
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="sarautile-labels.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
