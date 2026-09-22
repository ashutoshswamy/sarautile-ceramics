import Image from "next/image";
import {
  Amphora,
  BookOpen,
  Boxes,
  Droplets,
  Mail,
  MapPin,
  Tag,
} from "lucide-react";
import { wholesaleFacts } from "@/lib/data";
import { getCategories } from "@/lib/queries";
import FooterLink from "@/components/FooterLink";

const ICON_PROPS = { size: 15, strokeWidth: 1.7, className: "shrink-0 text-ink-faint" } as const;

const STUDIO_LINKS = [
  { href: "/story", label: "Our story", icon: <BookOpen {...ICON_PROPS} /> },
  { href: "/care", label: "Care", icon: <Droplets {...ICON_PROPS} /> },
  {
    href: "mailto:hello@sarautileceramics.in",
    label: "hello@sarautileceramics.in",
    icon: <Mail {...ICON_PROPS} />,
  },
];

export default async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="border-t border-rule">
      <div className="container-x section-tight">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-2">
              <Image src="/logo-nobg.png" alt="" width={2172} height={724} className="h-20 w-auto" />
            </span>
            <p className="lede text-sm mt-2 max-w-[34ch]">
              Wheel-thrown stoneware ceramics, glazed by hand and fired twice
              in a workshop in India.
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            <span className="kicker mb-2">Shop</span>
            <FooterLink href="/products" label="All products" icon={<Amphora {...ICON_PROPS} />} />
            {categories.map((c) => (
              <FooterLink
                key={c.slug}
                href={`/products?category=${c.slug}`}
                label={c.name}
                icon={<Tag {...ICON_PROPS} />}
              />
            ))}
          </nav>
          <nav className="flex flex-col gap-1">
            <span className="kicker mb-2">Studio</span>
            {STUDIO_LINKS.map((link) => (
              <FooterLink key={link.label} href={link.href} label={link.label} icon={link.icon} />
            ))}
          </nav>
          <nav className="flex flex-col gap-1">
            <span className="kicker mb-2">Wholesale</span>
            <FooterLink href="/wholesale" label="Trade enquiries" icon={<Boxes {...ICON_PROPS} />} />
            <span className="text-xs text-ink-faint py-1">
              {wholesaleFacts[0].v}, {wholesaleFacts[1].v.toLowerCase()}
            </span>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-rule text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} Sara Utile Ceramics</span>
          <span aria-hidden>·</span>
          <MapPin size={13} strokeWidth={1.7} className="shrink-0" />
          <span>Thrown in India, since 2019</span>
        </div>
      </div>
    </footer>
  );
}
