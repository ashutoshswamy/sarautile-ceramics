"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Footer.tsx stays a server component (it awaits getCategories()), so the
// hover motion for its link rows - previously plain Tailwind `group-hover:` -
// lives in this small client component instead.
//
// `icon` is a rendered element, not a component reference: passing the
// lucide component itself as a prop from the server Footer would send a
// function/class across the server/client boundary, which RSC rejects.
export default function FooterLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const el = linkRef.current;
    const icon = el?.querySelector("svg");
    if (!el) return;
    const enter = () => {
      gsap.to(el, { color: "var(--ink)", duration: 0.2 });
      if (icon) gsap.to(icon, { color: "var(--terracotta)", duration: 0.2 });
    };
    const leave = () => {
      gsap.to(el, { color: "var(--ink-soft)", duration: 0.2 });
      if (icon) gsap.to(icon, { color: "var(--ink-faint)", duration: 0.2 });
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <Link
      ref={linkRef}
      href={href}
      className="inline-flex items-center gap-2.5 py-1 text-sm text-ink-soft no-underline"
    >
      {icon}
      {label}
    </Link>
  );
}
