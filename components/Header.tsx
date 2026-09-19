"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, Shield, ShoppingCart, User, X } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { ProductsIcon, StoryIcon, CareIcon, WholesaleIcon } from "@/components/icons";

const NAV = [
  { href: "/products", label: "Shop", Icon: ProductsIcon },
  { href: "/story", label: "Our story", Icon: StoryIcon },
  { href: "/care", label: "Care", Icon: CareIcon },
  { href: "/wholesale", label: "Wholesale", Icon: WholesaleIcon },
];

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-terracotta text-paper text-[10px] font-semibold">
      {n}
    </span>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const { count: cartCount, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => setMenuOpen(false), [pathname]);

  const iconBtn =
    "relative shrink-0 grid place-items-center w-9 h-9 rounded-full border border-rule-strong text-ink cursor-pointer transition-colors hover:border-ink";

  return (
    <header className="site-header">
      <div className="container-x flex items-center gap-4 sm:gap-6 h-16">
        <Link
          href="/"
          aria-label="Sara Utile Ceramics - home"
          className="site-logo mr-auto text-[1.05rem] sm:text-lg font-medium tracking-tight text-ink no-underline whitespace-nowrap transition-opacity hover:opacity-70"
        >
          Sara Utile Ceramics
        </Link>

        <nav className="hidden sm:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link inline-flex items-center gap-2 text-sm text-ink-soft no-underline transition-colors hover:text-ink"
            >
              <item.Icon size={18} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <form
          action="/products"
          className="hidden sm:flex items-center gap-2 h-9 rounded-full border border-rule-strong pl-3.5 pr-1.5 transition-colors focus-within:border-ink"
        >
          <Search size={14} strokeWidth={1.8} className="text-ink-faint shrink-0" />
          <input
            type="search"
            name="q"
            placeholder="Search ceramics…"
            className="w-28 md:w-40 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </form>

        <div className="header-actions hidden sm:flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin" aria-label="Admin" className={iconBtn}>
              <Shield size={16} strokeWidth={1.6} />
            </Link>
          )}
          <Link href="/wishlist" aria-label="Wishlist" className={iconBtn}>
            <Heart size={16} strokeWidth={1.6} />
            <Badge n={wishCount} />
          </Link>
          {user ? (
            <UserButton />
          ) : (
            <Link
              href={`/signin?redirect_url=${encodeURIComponent(pathname)}`}
              aria-label="Sign in"
              className={iconBtn}
            >
              <User size={16} strokeWidth={1.6} />
            </Link>
          )}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className={iconBtn}
          >
            <ShoppingCart size={16} strokeWidth={1.6} />
            <Badge n={cartCount} />
          </button>
        </div>

        <button
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
          className={`sm:hidden ${iconBtn}`}
        >
          <ShoppingCart size={16} strokeWidth={1.6} />
          <Badge n={cartCount} />
        </button>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden shrink-0 flex items-center justify-center w-9 h-9 -mr-1.5 text-ink cursor-pointer"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
        </button>
      </div>

      <nav
        className="sm:hidden overflow-hidden border-t border-rule bg-paper transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: menuOpen
            ? `${(NAV.length + 3 + (isAdmin ? 1 : 0)) * 49 + 16}px`
            : "0px",
          opacity: menuOpen ? 1 : 0,
          borderTopWidth: menuOpen ? 1 : 0,
        }}
      >
        <div className="container-x flex flex-col py-2">
          <form
            action="/products"
            className="flex items-center gap-3 py-3 border-b border-rule"
          >
            <Search size={16} className="shrink-0 text-ink-faint" />
            <input
              type="search"
              name="q"
              placeholder="Search ceramics…"
              className="flex-1 bg-transparent text-[0.95rem] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </form>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-3 text-[0.95rem] text-ink no-underline border-b border-rule"
            >
              <item.Icon className="shrink-0 text-ink-faint" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            className="flex items-center gap-3 py-3 text-[0.95rem] text-ink no-underline border-b border-rule"
          >
            <Heart size={16} className="shrink-0 text-ink-faint" />
            Wishlist{wishCount > 0 ? ` (${wishCount})` : ""}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 py-3 text-[0.95rem] text-ink no-underline border-b border-rule"
            >
              <Shield size={16} className="shrink-0 text-ink-faint" />
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3 py-3 text-[0.95rem] text-ink">
              <UserButton />
              {user.fullName ?? user.primaryEmailAddress?.emailAddress}
            </div>
          ) : (
            <Link
              href={`/signin?redirect_url=${encodeURIComponent(pathname)}`}
              className="flex items-center gap-3 py-3 text-[0.95rem] text-ink no-underline"
            >
              <User size={16} className="shrink-0 text-ink-faint" />
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
