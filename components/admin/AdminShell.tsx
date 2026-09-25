"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  Amphora,
  Boxes,
  Tag,
  Layers,
  Receipt,
  Users,
  Percent,
  Star,
  Mail,
  Package,
  Camera,
  ExternalLink,
  Menu,
  Settings,
  X,
  UserCog,
  History,
} from "lucide-react";
import { SECTIONS, canAccess, panelBase, sectionHref, type Access, type Section } from "@/lib/adminSections";

const NAV: { section: Section; label: string; Icon: typeof LayoutGrid }[] = [
  { section: "dashboard", label: SECTIONS.dashboard, Icon: LayoutGrid },
  { section: "analytics", label: SECTIONS.analytics, Icon: BarChart3 },
  { section: "products", label: SECTIONS.products, Icon: Amphora },
  { section: "inventory", label: SECTIONS.inventory, Icon: Boxes },
  { section: "categories", label: SECTIONS.categories, Icon: Tag },
  { section: "collections", label: SECTIONS.collections, Icon: Layers },
  { section: "orders", label: SECTIONS.orders, Icon: Receipt },
  { section: "customers", label: SECTIONS.customers, Icon: Users },
  { section: "discounts", label: SECTIONS.discounts, Icon: Percent },
  { section: "reviews", label: SECTIONS.reviews, Icon: Star },
  { section: "kiln-signups", label: SECTIONS["kiln-signups"], Icon: Mail },
  { section: "wholesale", label: SECTIONS.wholesale, Icon: Package },
  { section: "instagram", label: SECTIONS.instagram, Icon: Camera },
  { section: "settings", label: SECTIONS.settings, Icon: Settings },
  { section: "staff", label: "Staff", Icon: UserCog },
  { section: "activity", label: "Staff activity", Icon: History },
];

function isActive(pathname: string, href: string, base: string) {
  return href === base ? pathname === base : pathname.startsWith(href);
}

function NavLinks({
  pathname,
  access,
  onNavigate,
}: {
  pathname: string;
  access: Access;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.filter((item) => canAccess(access, item.section)).map((item) => {
        const base = panelBase(access);
        const href = sectionHref(item.section, base);
        const active = isActive(pathname, href, base);
        return (
          <Link
            key={href}
            href={href}
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
  access,
  children,
}: {
  userLabel: string;
  access: Access;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change - adjusted during render, not in an effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

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
        <NavLinks pathname={pathname} access={access} />
        <div className="mt-auto flex flex-col gap-4">
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
          <span className="kicker">{access.role === "admin" ? "Admin" : "Staff"}</span>
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
            <NavLinks pathname={pathname} access={access} onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto flex flex-col gap-4">
              <div>
                <span className="kicker">{access.role === "admin" ? "Admin" : "Staff"}</span>
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
