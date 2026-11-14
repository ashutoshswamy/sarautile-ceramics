# Sara Utile Ceramics

Storefront and admin panel for [sarautileceramics.in](https://sarautileceramics.in) - handmade wheel-thrown stoneware from India, sold in INR.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- [Supabase](https://supabase.com) - Postgres + Storage (catalog, orders, carts, wishlists, reviews)
- [Clerk](https://clerk.com) - sign-in, admin/staff roles (also used as Supabase third-party auth)
- [Razorpay](https://razorpay.com) - payments and refunds
- `@react-pdf/renderer` - invoices and shipping labels · GSAP - motion
- Deployed on Vercel

> This Next.js version has breaking changes from older releases (e.g. `proxy.ts` replaces `middleware.ts`). See `AGENTS.md`.

## Features

**Storefront** - products, categories, collections, search and sort, wishlist, cart drawer, Razorpay checkout with discount codes, customer profile (orders, saved addresses, self-service cancellation), product reviews and a care page. Responsive from 320px up.

**Admin panel** (`/admin`, staff at `/staff`) - dashboard, analytics, products, inventory, categories, collections, orders, customers, discounts, reviews, Instagram feed, staff access and an activity log.

**Order fulfilment**
1. **Orders -> To ship** lists `pending` and `processing` orders. Tick the ones you want, or tick none to use all of them.
2. **Shiprocket CSV** downloads a file in Shiprocket's bulk-import template. Upload it in Shiprocket. Create each product there with its slug as the Master SKU.
3. **Print labels** opens an A6 box label per order (ship-to, items, weight, "fragile"). **Bulk invoices** opens one PDF with an invoice per order. Single invoices download from the order row.
4. **Mark as shipped** moves the ticked orders to `shipped`.
5. **Cancel order & refund** (admin order page, or the customer's profile while the order is `pending`/`processing`) refunds the full payment through Razorpay, puts the stock back and marks the order `cancelled`. If the refund fails the order is left as it was.

Set your pickup address for labels in `SHIP_FROM` in `lib/site.ts`. Package size and the default weight for the CSV live at the top of `app/admin/orders/export/route.ts`.

**SEO** - per-page metadata and canonicals, DB-driven `sitemap.xml`, `robots.txt`, `/llms.txt`, and JSON-LD (Organization, WebSite, Product, BreadcrumbList, CollectionPage). Social card: `public/og-image.jpg`.