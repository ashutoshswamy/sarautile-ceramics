import { requireAdmin } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Sarautile Ceramics" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const userLabel = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Admin";

  return <AdminShell userLabel={userLabel}>{children}</AdminShell>;
}
