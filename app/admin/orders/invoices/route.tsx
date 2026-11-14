import { Document, renderToBuffer } from "@react-pdf/renderer";
import { requireSection } from "@/lib/adminAuth";
import { InvoicePage } from "@/lib/pdf/invoice";
import { filterFromRequest, loadPdfOrders } from "@/lib/pdf/orders";
import "@/lib/pdf/shared";

// ?id=1&id=2 for chosen orders; no ids = every pending/processing order.
export async function GET(req: Request) {
  await requireSection("orders");
  const orders = await loadPdfOrders(filterFromRequest(req));
  if (orders.length === 0) return new Response("No orders to print.", { status: 404 });

  const pdf = await renderToBuffer(
    <Document title="Invoices">
      {orders.map((o) => (
        <InvoicePage key={o.id} order={o} />
      ))}
    </Document>
  );
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="sarautile-invoices.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
