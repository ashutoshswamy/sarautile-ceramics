// Admin panel sections, keyed by their /admin/<key> path segment. Shared by
// the proxy (route guard), server actions (permission + log label), and the
// sidebar (which links to show). Staff can be granted any of these; "staff"
// and "activity" are admin-only and deliberately not in this list.
export const SECTIONS = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  products: "Products",
  inventory: "Inventory",
  categories: "Categories",
  collections: "Collections",
  orders: "Orders",
  customers: "Customers",
  discounts: "Discounts",
  reviews: "Reviews",
  "kiln-signups": "Kiln signups",
  wholesale: "Wholesale",
  instagram: "Instagram",
  settings: "Settings",
} as const;

export type Section = keyof typeof SECTIONS | "staff" | "activity";

// Lives in Clerk publicMetadata: { role: "admin" } or
// { role: "staff", sections: ["orders", ...] }.
export type Access = { role: "admin" } | { role: "staff"; sections: string[] };

export function accessOf(meta: Record<string, unknown> | undefined): Access | null {
  if (meta?.role === "admin") return { role: "admin" };
  if (meta?.role === "staff") {
    return { role: "staff", sections: Array.isArray(meta.sections) ? meta.sections.map(String) : [] };
  }
  return null;
}

export function canAccess(access: Access, section: Section) {
  return access.role === "admin" || access.sections.includes(section);
}

export function sectionOf(pathname: string): Section {
  return (pathname.split("/")[2] || "dashboard") as Section;
}

export function sectionHref(section: Section) {
  return section === "dashboard" ? "/admin" : `/admin/${section}`;
}

export function isSection(key: string): key is keyof typeof SECTIONS {
  return Object.hasOwn(SECTIONS, key);
}
