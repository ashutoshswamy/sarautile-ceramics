"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";

const NAV = [
  { href: "/mugs", label: "Mugs" },
  { href: "/story", label: "Our story" },
  { href: "/care", label: "Care" },
  { href: "/wholesale", label: "Wholesale" },
];

export default function Header() {
  const { setOpen, count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // On a page with the hero scroll sequence, stay hidden until it finishes
    // (hero bottom reaches the viewport bottom). Elsewhere: always shown.
    const compute = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        setShown(true);
        return;
      }
      setShown(hero.getBoundingClientRect().bottom <= window.innerHeight + 1);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="site-header" data-hidden={!shown}>
      <div className="container-x flex items-center gap-4 sm:gap-8 h-16">
        <Link
          href="/"
          className="mr-auto text-[1.05rem] sm:text-lg font-medium tracking-tight text-ink no-underline whitespace-nowrap transition-opacity hover:opacity-70"
        >
          Sarautile Ceramics
        </Link>

        <nav className="hidden sm:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link text-sm text-ink-soft no-underline transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 h-9 pl-3.5 pr-2.5 rounded-full border border-rule-strong text-sm text-ink cursor-pointer transition-all hover:border-ink hover:-translate-y-px active:translate-y-0"
        >
          Cart
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-terracotta text-paper text-[11px] font-semibold">
            {count}
          </span>
        </button>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden shrink-0 flex flex-col justify-center gap-[5px] w-9 h-9 -mr-1.5 cursor-pointer"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-[1.5px] w-5 bg-ink transition-transform duration-300 ${
              menuOpen ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-ink transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-ink transition-transform duration-300 ${
              menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <nav
        className="sm:hidden overflow-hidden border-t border-rule bg-paper transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: menuOpen ? `${NAV.length * 49 + 16}px` : "0px",
          opacity: menuOpen ? 1 : 0,
          borderTopWidth: menuOpen ? 1 : 0,
        }}
      >
        <div className="container-x flex flex-col py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 text-[0.95rem] text-ink no-underline border-b border-rule last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
