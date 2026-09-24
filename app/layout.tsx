import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { WishlistProvider } from "@/components/WishlistContext";
import { CartProvider } from "@/components/CartContext";
import { ProductsProvider } from "@/components/ProductsContext";
import { ToastProvider } from "@/components/Toaster";
import ToastFromQuery from "@/components/ToastFromQuery";
import Loader from "@/components/Loader";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const description =
  "Handmade wheel-thrown stoneware from India - mugs, bowls, plates and vases, glazed in five colours mixed by hand and fired twice. Shop small-batch ceramics online.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sara Utile Ceramics - handmade stoneware pottery from India",
  description,
  applicationName: SITE_NAME,
  keywords: [
    "handmade ceramics India",
    "stoneware pottery",
    "wheel-thrown mugs",
    "ceramic bowls",
    "handmade plates",
    "ceramic vases",
    "Sara Utile Ceramics",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "Sara Utile Ceramics - handmade stoneware pottery",
    description,
    images: [{ url: "/og-image.png", width: 1730, height: 909, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sara Utile Ceramics - handmade stoneware pottery",
    description,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = { themeColor: "#fff7ed" };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      signInUrl="/signin"
      signUpUrl="/signup"
      appearance={{
        variables: {
          colorPrimary: "#f25c54",
          colorBackground: "#ffffff",
          colorForeground: "#33243a",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" className={`${dmSans.variable} font-sans`}>
        <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
          <ProductsProvider>
            <WishlistProvider>
              <CartProvider>
                <ToastProvider>
                  <Suspense fallback={null}>
                    <ToastFromQuery />
                  </Suspense>
                  <Loader />
                  <Header />
                  <main className="flex-1">{children}</main>
                  <SiteFooter>
                    <Footer />
                  </SiteFooter>
                  <CartDrawer />
                </ToastProvider>
              </CartProvider>
            </WishlistProvider>
          </ProductsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
