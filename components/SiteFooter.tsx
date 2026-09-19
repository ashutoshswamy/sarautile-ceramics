"use client";

import { usePathname } from "next/navigation";
import BrandWordmark from "@/components/BrandWordmark";

export default function SiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {children}
      <BrandWordmark />
    </>
  );
}
