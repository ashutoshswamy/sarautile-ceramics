"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Menu, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthContext";
import { MugIcon, StoryIcon, CareIcon, WholesaleIcon } from "@/components/icons";

// ponytail: header is always shown now - the old hero-scroll-gated hide went with the scroll sequence.

const NAV = [
  { href: "/mugs", label: "Mugs", Icon: MugIcon },
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
  // `scrolled` = target layout (top pill vs. right rail). `fading` briefly hides
  // the bar so the layout swap (flex-direction / writing-mode can't tween) reads
  // as a crossfade instead of a snap.
  const [scrolled, setScrolled] = useState(false);
  const [fading, setFading] = useState(false);
  const scrolledRef = useRef(false);
  const pathname = usePathname();

  const { count: cartCount, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useAuth();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      // hysteresis so it doesn't flicker while hovering the threshold
      const y = window.scrollY;
      const next = scrolledRef.current ? y > 24 : y > 56;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setFading(true);
      clearTimeout(swap);
      swap = setTimeout(() => {
        setScrolled(next);
        setFading(false);
      }, 170);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(swap);
    };
  }, []);

  const iconBtn =
    "relative shrink-0 grid place-items-center w-9 h-9 rounded-full border border-rule-strong text-ink cursor-pointer transition-colors hover:border-ink";

  return (
    <header className="site-header" data-scrolled={scrolled} data-fading={fading}>
      <div className="container-x flex items-center gap-4 sm:gap-6 h-16">
        <Link
          href="/"
          aria-label="Sarautile Ceramics - home"
          className="site-logo mr-auto text-[1.05rem] sm:text-lg font-medium tracking-tight text-ink no-underline whitespace-nowrap transition-opacity hover:opacity-70"
        >
          <span className="nav-label">Sarautile Ceramics</span>
          <Home size={19} strokeWidth={1.6} className="site-logo__mark" />
        </Link>

        <nav className="hidden sm:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link inline-flex items-center gap-2 text-sm text-ink-soft no-underline transition-colors hover:text-ink"
            >
              <item.Icon size={18} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="header-actions hidden sm:flex items-center gap-2">
          <Link href="/wishlist" aria-label="Wishlist" className={iconBtn}>
            <Heart size={16} strokeWidth={1.6} />
            <Badge n={wishCount} />
          </Link>
          <Link
            href="/signin"
            aria-label={user ? "Account" : "Sign in"}
            className={iconBtn}
          >
            {user ? (
              <span className="text-xs font-semibold uppercase">
                {user.name.slice(0, 1)}
              </span>
            ) : (
              <User size={16} strokeWidth={1.6} />
            )}
          </Link>
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
          maxHeight: menuOpen ? `${(NAV.length + 2) * 49 + 16}px` : "0px",
          opacity: menuOpen ? 1 : 0,
          borderTopWidth: menuOpen ? 1 : 0,
        }}
      >
        <div className="container-x flex flex-col py-2">
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
          <Link
            href="/signin"
            className="flex items-center gap-3 py-3 text-[0.95rem] text-ink no-underline"
          >
            <User size={16} className="shrink-0 text-ink-faint" />
            {user ? user.name : "Sign in"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
