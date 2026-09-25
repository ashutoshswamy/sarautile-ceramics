import { getAdminAccess } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Sara Utile Ceramics",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Per-section access is enforced in proxy.ts; this only admits admin/staff.
  const { access, label } = await getAdminAccess();

  return <AdminShell userLabel={label} access={access}>{children}</AdminShell>;
}
