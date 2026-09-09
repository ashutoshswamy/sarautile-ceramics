import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/mugs", label: "All mugs" },
      { href: "/mugs", label: "Seconds shelf" },
      { href: "/wholesale", label: "Wholesale" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { href: "/story", label: "Our story" },
      { href: "/care", label: "Care" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="container-x section-tight">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <span className="text-lg font-medium text-ink">
              Sarautile Ceramics
            </span>
            <p className="lede text-sm mt-2 max-w-[34ch]">
              Wheel-thrown stoneware mugs, glazed by hand and fired twice in a
              workshop in India.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} className="flex flex-col gap-2.5">
              <span className="kicker mb-1">{col.heading}</span>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-ink-soft no-underline transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              {col.heading === "Studio" && (
                <a
                  href="mailto:hello@sarautileceramics.in"
                  className="text-sm text-ink-soft no-underline transition-colors hover:text-ink"
                >
                  hello@sarautileceramics.in
                </a>
              )}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-10 pt-6 border-t border-rule text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} Sarautile Ceramics</span>
          <span aria-hidden>·</span>
          <span>Thrown in India, since 2019</span>
        </div>
      </div>
    </footer>
  );
}
