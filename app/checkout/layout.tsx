import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout — Sarautile Ceramics" };

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
