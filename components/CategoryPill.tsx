"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { useHoverTween } from "@/lib/gsap";

// Was `transition-colors hover:border-rule-strong` on the inactive pill state.
export default function CategoryPill({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  // no-op hover target when active, so the active pill's border-ink stays put
  useHoverTween(ref, { borderColor: active ? "var(--ink)" : "var(--rule-strong)" });

  return (
    <Link
      ref={ref}
      href={href}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm no-underline ${
        active ? "border-ink bg-ink text-paper" : "border-rule text-ink"
      }`}
    >
      {children}
      {typeof count === "number" && (
        <span className={active ? "text-paper/60" : "text-ink-faint"}>{count}</span>
      )}
    </Link>
  );
}
