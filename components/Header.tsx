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
import { gsap, useGSAP } from "@/lib/gsap";

const MAX_SUGGESTIONS_PER_GROUP = 4;

const NAV = [
  { href: "/products", label: "Shop", Icon: ProductsIcon },
  { href: "/story", label: "Our story", Icon: StoryIcon },
  { href: "/care", label: "Care", Icon: CareIcon },
  { href: "/wholesale", label: "Wholesale", Icon: WholesaleIcon },
];

// GSAP replacement for the old `.nav-link:hover .icon-write/.icon-drop/.icon-box`
// keyframes in globals.css - same timings, triggered from JS instead of CSS.
function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hoverHandlers(toVars: gsap.TweenVars, fromVars: gsap.TweenVars, duration = 0.2) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => gsap.to(e.currentTarget, { ...toVars, duration }),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => gsap.to(e.currentTarget, { ...fromVars, duration }),
  };
}

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-terracotta text-paper text-[10px] font-semibold">
      {n}
    </span>
  );
}

function NavLink({ href, label, Icon }: (typeof NAV)[number]) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = linkRef.current;
    const underline = underlineRef.current;
    if (!el || !underline) return;

    gsap.set(underline, { scaleX: 0, transformOrigin: "left center" });

    const writeEl = el.querySelector<HTMLElement>(".icon-write");
    if (writeEl) writeEl.style.transformBox = "fill-box";
    const dropEls = Array.from(el.querySelectorAll<HTMLElement>(".icon-drop"));
    const boxEls = Array.from(el.querySelectorAll<HTMLElement>(".icon-box"));
    const microEls = [...dropEls, ...boxEls];

    let tl: gsap.core.Timeline | null = null;

    const enter = () => {
      gsap.to(el, { color: "var(--ink)", duration: 0.2 });
      gsap.to(underline, { scaleX: 1, duration: 0.24, ease: "power2.out" });
      if (reducedMotion()) return;

      tl?.kill();
      tl = gsap.timeline();

      if (writeEl) {
        tl.set(writeEl, { transformOrigin: "85% 85%" }, 0)
          .to(writeEl, { rotate: -16, duration: 0.15, ease: "power1.inOut" }, 0)
          .to(writeEl, { rotate: 10, duration: 0.3, ease: "power1.inOut" })
          .to(writeEl, { rotate: -16, duration: 0.3, ease: "power1.inOut" })
          .to(writeEl, { rotate: 10, duration: 0.3, ease: "power1.inOut" })
          .to(writeEl, { rotate: 0, duration: 0.15, ease: "power1.inOut" });
      }
      dropEls.forEach((elx) => {
        const delay = elx.classList.contains("icon-drop-2") ? 0.2 : 0;
        tl!.fromTo(elx, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, delay);
      });
      boxEls.forEach((elx) => {
        const delay = elx.classList.contains("icon-box-1") ? 0.15 : elx.classList.contains("icon-box-2") ? 0.3 : 0;
        tl!.fromTo(elx, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, delay);
      });
    };

    const leave = () => {
      gsap.to(el, { color: "var(--ink-soft)", duration: 0.2 });
      gsap.to(underline, { scaleX: 0, duration: 0.24, ease: "power2.out" });
      tl?.kill();
      if (writeEl) gsap.set(writeEl, { rotate: 0 });
      if (microEls.length) gsap.set(microEls, { clearProps: "opacity,y" });
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
      className="nav-link relative inline-flex items-center gap-2 text-sm text-ink-soft no-underline"
    >
      <Icon size={18} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
      <span>{label}</span>
      <span
        ref={underlineRef}
        aria-hidden
        className="absolute left-0 -bottom-[5px] h-[1.5px] w-full bg-current"
      />
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const searchScrimRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
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

  // Reset menu/search on route change - adjusted during render (React's
  // documented pattern) instead of an effect, so it can't cascade renders.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    closeSearch();
  }

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

  // Mobile nav open/close - replaces the old inline maxHeight/opacity transition.
  useGSAP(
    () => {
      const el = mobileNavRef.current;
      if (!el) return;
      if (menuOpen) {
        gsap.set(el, { height: "auto" });
        const h = el.offsetHeight;
        gsap.fromTo(
          el,
          { height: 0, opacity: 0 },
          {
            height: h,
            opacity: 1,
            duration: reducedMotion() ? 0 : 0.3,
            ease: "power2.out",
            onComplete: () => gsap.set(el, { height: "auto" }),
          }
        );
      } else {
        gsap.to(el, { height: 0, opacity: 0, duration: reducedMotion() ? 0 : 0.3, ease: "power2.out" });
      }
    },
    { dependencies: [menuOpen] }
  );

  // Search overlay open/close - replaces the old `[data-open="true"]` CSS transitions.
  useGSAP(
    () => {
      const scrim = searchScrimRef.current;
      const panel = searchPanelRef.current;
      if (!scrim || !panel) return;
      const d = reducedMotion() ? 0 : undefined;
      if (searchOpen) {
        gsap.to(scrim, { autoAlpha: 1, duration: d ?? 0.28, ease: "power1.out" });
        gsap.to(panel, {
          autoAlpha: 1,
          x: "-50%",
          y: 0,
          scale: 1,
          duration: d ?? 0.24,
          ease: "power2.out",
        });
      } else {
        gsap.to(scrim, { autoAlpha: 0, duration: d ?? 0.28, ease: "power1.out" });
        gsap.to(panel, {
          autoAlpha: 0,
          x: "-50%",
          y: -8,
          scale: 0.98,
          duration: d ?? 0.24,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [searchOpen] }
  );

  const iconBtnHover = hoverHandlers({ borderColor: "var(--ink)" }, { borderColor: "var(--rule-strong)" });
  const iconBtn =
    "relative shrink-0 grid place-items-center w-9 h-9 rounded-full border border-rule-strong text-ink cursor-pointer";

  return (
    <header className="site-header">
      <div className="container-x flex items-center gap-4 sm:gap-6 h-20 sm:h-24">
        <Link
          href="/"
          aria-label="Sara Utile Ceramics - home"
          className="site-logo mr-auto shrink-0 flex items-center gap-2 text-[1.05rem] sm:text-lg font-medium tracking-tight text-ink no-underline"
          {...hoverHandlers({ opacity: 0.7 }, { opacity: 1 })}
        >
          <Image src="/logo-nobg.png" alt="" width={2172} height={724} priority className="h-16 w-auto sm:h-20" />
        </Link>

        <nav className="hidden sm:flex items-center gap-7">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
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
              {...iconBtnHover}
            >
              <User size={16} strokeWidth={1.6} />
            </Link>
          )}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className={iconBtn}
            {...iconBtnHover}
          >
            <Search size={16} strokeWidth={1.6} />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className={iconBtn}
            {...iconBtnHover}
          >
            <ShoppingCart size={16} strokeWidth={1.6} />
            <Badge n={cartCount} />
          </button>
        </div>

        <button
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
          className={`sm:hidden ${iconBtn}`}
          {...iconBtnHover}
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
        ref={mobileNavRef}
        className="sm:hidden overflow-hidden bg-paper"
        style={{
          height: 0,
          opacity: 0,
          borderTop: menuOpen ? "1px solid var(--rule)" : "none",
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

      <div
        className="search-overlay"
        style={{ pointerEvents: searchOpen ? "auto" : "none" }}
      >
        <div
          ref={searchScrimRef}
          className="search-overlay__scrim"
          style={{ opacity: 0 }}
          onClick={() => closeSearch()}
        />
        <div
          ref={searchPanelRef}
          className="search-overlay__panel"
          style={{ opacity: 0, transform: "translate(-50%, -8px) scale(0.98)" }}
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
              className="text-ink-soft cursor-pointer"
              {...hoverHandlers({ color: "var(--ink)" }, { color: "var(--ink-soft)" })}
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
                          {...hoverHandlers({ backgroundColor: "var(--canvas)" }, { backgroundColor: "transparent" }, 0.15)}
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
                          {...hoverHandlers({ backgroundColor: "var(--canvas)" }, { backgroundColor: "transparent" }, 0.15)}
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
                          {...hoverHandlers({ backgroundColor: "var(--canvas)" }, { backgroundColor: "transparent" }, 0.15)}
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
