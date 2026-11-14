"use client";

import { usePathname } from "next/navigation";

export default function SiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hides storefront chrome (header/footer) inside the admin + staff panels.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/staff")) return null;

  return <>{children}</>;
}
