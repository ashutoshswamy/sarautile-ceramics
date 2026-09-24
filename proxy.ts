import { clerkMiddleware } from "@clerk/nextjs/server";

// Named `proxy` (not `middleware`) - this Next.js version renamed the file
// convention. clerkMiddleware() just needs to run on every request so the
// Clerk session is available to server components; no route protection here,
// pages decide what to show a signed-out visitor.
export const proxy = clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
    // Clerk's Frontend API proxy serves clerk.browser.js etc. from here - the
    // static-file exclusion above would otherwise skip those .js requests.
    "/__clerk/(.*)",
  ],
};
