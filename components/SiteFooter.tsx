"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import BrandWordmark from "@/components/BrandWordmark";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Footer />
      <BrandWordmark />
    </>
  );
}
