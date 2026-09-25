import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  accessOf,
  canAccess,
  panelBase,
  sectionHref,
  sectionOf,
  ADMIN_BASE,
  SECTIONS,
  STAFF_BASE,
  type Section,
} from "@/lib/adminSections";

const underPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(prefix + "/");

// Named `proxy` (not `middleware`) - this Next.js version renamed the file
// convention. clerkMiddleware() needs to run on every request so the Clerk
// session is available to server components. Only the panel is guarded here:
// layouts don't re-render on client-side navigation, so this is the one place
// that sees every panel request and can enforce per-section staff access.
// Admins use /admin; staff use /staff, which is rewritten onto the same
// app/admin pages. Each role is bounced to its own prefix, so hardcoded
// /admin links inside the pages still land staff on /staff.
// Signed-out / non-staff visitors pass through - app/admin/layout.tsx handles them.
export const proxy = clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const onStaff = underPrefix(url.pathname, STAFF_BASE);
  if (!onStaff && !underPrefix(url.pathname, ADMIN_BASE)) return;

  const adminPath = onStaff ? ADMIN_BASE + url.pathname.slice(STAFF_BASE.length) : url.pathname;
  const toAdmin = () => {
    const target = url.clone();
    target.pathname = adminPath;
    return target;
  };

  const { userId } = await auth();
  if (!userId) return onStaff ? NextResponse.rewrite(toAdmin()) : undefined;
  const user = await (await clerkClient()).users.getUser(userId);
  const access = accessOf(user.publicMetadata);
  if (!access) return onStaff ? NextResponse.rewrite(toAdmin()) : undefined;

  const base = panelBase(access);
  if (!canAccess(access, sectionOf(adminPath))) {
    // Staff without this section: send them to the first one they do have.
    const first = (Object.keys(SECTIONS) as Section[]).find((s) => canAccess(access, s));
    return NextResponse.redirect(new URL(first ? sectionHref(first, base) : "/", req.url));
  }

  if (access.role === "staff" && !onStaff) {
    const target = url.clone();
    target.pathname = STAFF_BASE + adminPath.slice(ADMIN_BASE.length);
    return NextResponse.redirect(target);
  }
  if (access.role === "admin" && onStaff) return NextResponse.redirect(toAdmin());
  if (onStaff) return NextResponse.rewrite(toAdmin());
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
    // Clerk's Frontend API proxy serves clerk.browser.js etc. from here - the
    // static-file exclusion above would otherwise skip those .js requests.
    "/__clerk/(.*)",
  ],
};
