import Link from "next/link";
import {
  BookOpen,
  Boxes,
  Coffee,
  Droplets,
  Mail,
  MapPin,
  Tag,
} from "lucide-react";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/mugs", label: "All mugs", Icon: Coffee },
      { href: "/mugs", label: "Seconds shelf", Icon: Tag },
      { href: "/wholesale", label: "Wholesale", Icon: Boxes },
    ],
  },
  {
    heading: "Studio",
    links: [
      { href: "/story", label: "Our story", Icon: BookOpen },
      { href: "/care", label: "Care", Icon: Droplets },
      { href: "mailto:hello@sarautileceramics.in", label: "hello@sarautileceramics.in", Icon: Mail },
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
            <nav key={col.heading} className="flex flex-col gap-1">
              <span className="kicker mb-2">{col.heading}</span>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group inline-flex items-center gap-2.5 py-1 text-sm text-ink-soft no-underline transition-colors hover:text-ink"
                >
                  <link.Icon
                    size={15}
                    strokeWidth={1.7}
                    className="shrink-0 text-ink-faint transition-colors group-hover:text-terracotta"
                  />
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-rule text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} Sarautile Ceramics</span>
          <span aria-hidden>·</span>
          <MapPin size={13} strokeWidth={1.7} className="shrink-0" />
          <span>Thrown in India, since 2019</span>
        </div>
      </div>
    </footer>
  );
}
