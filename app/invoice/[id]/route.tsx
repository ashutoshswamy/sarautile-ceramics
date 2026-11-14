import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { InvoicePage } from "@/lib/pdf/invoice";
import { loadPdfOrders } from "@/lib/pdf/orders";
import "@/lib/pdf/shared";

export async function GET(_req: Request, ctx: RouteContext<"/invoice/[id]">) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) redirect(`/signin?redirect_url=/invoice/${id}`);

  const orderId = Number(id);
  const [order] = Number.isInteger(orderId) ? await loadPdfOrders({ ids: [orderId] }) : [];

  const isAdmin = user.publicMetadata?.role === "admin";
  if (!order || !order.razorpay_payment_id || (order.user_id !== user.id && !isAdmin)) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await renderToBuffer(
    <Document title={`Invoice #${order.id}`} author="Sara Utile Ceramics">
      <InvoicePage order={order} />
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
