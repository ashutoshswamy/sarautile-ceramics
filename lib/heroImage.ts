import { pickMugImage } from "@/lib/mugImages";

// Shown on the storefront and in the admin preview whenever a breakpoint has
// no admin-set image yet.
export const DEFAULT_HERO_IMAGE = pickMugImage("sarautile hero spread");
