"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  Coffee,
  Boxes,
  Tag,
  Layers,
  Receipt,
  Mail,
  ExternalLink,
  Menu,
  Settings,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutGrid },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/mugs", label: "Mugs", Icon: Coffee },
  { href: "/admin/inventory", label: "Inventory", Icon: Boxes },
  { href: "/admin/categories", label: "Categories", Icon: Tag },
  { href: "/admin/collections", label: "Collections", Icon: Layers },
  { href: "/admin/orders", label: "Orders", Icon: Receipt },
  { href: "/admin/kiln-signups", label: "Kiln signups", Icon: Mail },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm no-underline transition-colors border-l-2 ${
              active
                ? "bg-canvas text-ink font-medium border-terracotta"
                : "text-ink-soft border-transparent hover:bg-canvas hover:text-ink"
            }`}
          >
            <item.Icon
              size={16}
              strokeWidth={1.7}
              className={`shrink-0 ${active ? "text-terracotta" : "text-ink-faint"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  userLabel,
  children,
}: {
  userLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:grid md:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:gap-8 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto border-r border-rule px-5 py-8">
        <NavLinks pathname={pathname} />
        <div className="mt-auto flex flex-col gap-4">
          <div>
            <span className="kicker">Admin</span>
            <p className="text-sm text-ink-soft mt-1 truncate">{userLabel}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-ink-faint no-underline hover:text-ink"
          >
            <ExternalLink size={13} strokeWidth={1.7} aria-hidden />
            View store
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-rule bg-paper px-5 py-3.5">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={menuOpen}
          className="flex items-center justify-center w-9 h-9 -ml-1.5 text-ink cursor-pointer"
        >
          <Menu size={22} strokeWidth={1.6} />
        </button>
        <div className="min-w-0">
          <span className="kicker">Admin</span>
          <p className="text-xs text-ink-soft truncate">{userLabel}</p>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-[300px] bg-paper border-r border-rule px-5 py-6 flex flex-col gap-8 overflow-y-auto">
            <div className="flex items-start justify-end">
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close admin menu"
                className="shrink-0 flex items-center justify-center w-8 h-8 -mr-1.5 -mt-1 text-ink-soft cursor-pointer hover:text-ink"
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto flex flex-col gap-4">
              <div>
                <span className="kicker">Admin</span>
                <p className="text-sm text-ink-soft mt-1 truncate">{userLabel}</p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-ink-faint no-underline hover:text-ink"
              >
                <ExternalLink size={13} strokeWidth={1.7} aria-hidden />
                View store
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-7 sm:px-10 sm:py-8">{children}</div>
    </div>
  );
}
