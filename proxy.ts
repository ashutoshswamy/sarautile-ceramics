import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { accessOf, canAccess, sectionHref, sectionOf, SECTIONS, type Section } from "@/lib/adminSections";

// Named `proxy` (not `middleware`) - this Next.js version renamed the file
// convention. clerkMiddleware() needs to run on every request so the Clerk
// session is available to server components. Only /admin is guarded here:
// layouts don't re-render on client-side navigation, so this is the one place
// that sees every admin page request and can enforce per-section staff access.
// Signed-out / non-staff visitors pass through - app/admin/layout.tsx handles them.
export const proxy = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return;

  const { userId } = await auth();
  if (!userId) return;
  const user = await (await clerkClient()).users.getUser(userId);
  const access = accessOf(user.publicMetadata);
  if (!access || canAccess(access, sectionOf(pathname))) return;

  // Staff without this section: send them to the first one they do have.
  const first = (Object.keys(SECTIONS) as Section[]).find((s) => canAccess(access, s));
  return NextResponse.redirect(new URL(first ? sectionHref(first) : "/", req.url));
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
