"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Layers, Menu, Search, Shield, ShoppingCart, User, X } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useProducts } from "@/components/ProductsContext";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { ProductsIcon, StoryIcon, CareIcon, WholesaleIcon } from "@/components/icons";

const MAX_SUGGESTIONS_PER_GROUP = 4;

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const { count: cartCount, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { products, categories, collections } = useProducts();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => closeSearch(), [pathname]);

  const q = query.trim().toLowerCase();
  const matchedProducts = q
    ? products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS_PER_GROUP)
    : [];
  const matchedCategories = q
    ? categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS_PER_GROUP)
    : [];
  const matchedCollections = q
    ? collections.filter((c) => c.name.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS_PER_GROUP)
    : [];
  const hasSuggestions =
    matchedProducts.length > 0 || matchedCategories.length > 0 || matchedCollections.length > 0;

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSearch();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  const iconBtn =
    "relative shrink-0 grid place-items-center w-9 h-9 rounded-full border border-rule-strong text-ink cursor-pointer transition-colors hover:border-ink";

  return (
    <header className="site-header">
      <div className="container-x flex items-center gap-4 sm:gap-6 h-20 sm:h-24">
        <Link
          href="/"
          aria-label="Sara Utile Ceramics - home"
          className="site-logo mr-auto shrink-0 flex items-center gap-2 text-[1.05rem] sm:text-lg font-medium tracking-tight text-ink no-underline transition-opacity hover:opacity-70"
        >
          <Image src="/logo-nobg.png" alt="" width={160} height={64} priority className="h-16 w-auto sm:h-20" />
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

        <div className="header-actions hidden sm:flex items-center gap-2">
          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ""}`}
                  href="/wishlist"
                  labelIcon={<Heart size={16} strokeWidth={1.6} />}
                />
                {isAdmin && (
                  <UserButton.Link
                    label="Admin"
                    href="/admin"
                    labelIcon={<Shield size={16} strokeWidth={1.6} />}
                  />
                )}
              </UserButton.MenuItems>
            </UserButton>
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
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className={iconBtn}
          >
            <Search size={16} strokeWidth={1.6} />
          </button>
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
          {user ? (
            <div className="flex items-center gap-3 py-3 text-[0.95rem] text-ink">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ""}`}
                    href="/wishlist"
                    labelIcon={<Heart size={16} strokeWidth={1.6} />}
                  />
                  {isAdmin && (
                    <UserButton.Link
                      label="Admin"
                      href="/admin"
                      labelIcon={<Shield size={16} strokeWidth={1.6} />}
                    />
                  )}
                </UserButton.MenuItems>
              </UserButton>
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

      <div className="search-overlay" data-open={searchOpen}>
        <div className="search-overlay__scrim" onClick={() => closeSearch()} />
        <div
          className="search-overlay__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <form action="/products" className="flex items-center gap-3">
            <Search size={18} strokeWidth={1.8} className="text-ink-faint shrink-0" />
            <input
              ref={searchInputRef}
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ceramics…"
              className="flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              type="button"
              onClick={() => closeSearch()}
              aria-label="Close search"
              className="text-ink-soft cursor-pointer transition-colors hover:text-ink"
            >
              <X size={20} strokeWidth={1.6} />
            </button>
          </form>

          {q && (
            <div className="search-overlay__results">
              {!hasSuggestions ? (
                <p className="text-sm text-ink-faint px-1 py-3">
                  No matches for &quot;{query.trim()}&quot;.
                </p>
              ) : (
                <>
                  {matchedProducts.length > 0 && (
                    <div className="search-overlay__group">
                      <span className="search-overlay__group-label">Products</span>
                      {matchedProducts.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          onClick={() => closeSearch()}
                          className="search-overlay__item"
                        >
                          <PlaceholderPhoto
                            label={p.photoLabel}
                            src={p.imageUrl}
                            rounded="rounded-md"
                            className="w-9 h-9 shrink-0"
                            sizes="36px"
                          />
                          <span>{p.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {matchedCategories.length > 0 && (
                    <div className="search-overlay__group">
                      <span className="search-overlay__group-label">Categories</span>
                      {matchedCategories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/products?category=${c.slug}`}
                          onClick={() => closeSearch()}
                          className="search-overlay__item"
                        >
                          <Menu size={16} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
                          <span>{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {matchedCollections.length > 0 && (
                    <div className="search-overlay__group">
                      <span className="search-overlay__group-label">Collections</span>
                      {matchedCollections.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/collections/${c.slug}`}
                          onClick={() => closeSearch()}
                          className="search-overlay__item"
                        >
                          <Layers size={16} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
                          <span>{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
