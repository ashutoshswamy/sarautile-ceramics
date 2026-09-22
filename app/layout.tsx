import type { Metadata } from "next";
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

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sara Utile Ceramics - ceramics made slowly, on a wheel, by two people",
  description:
    "Wheel-thrown stoneware mugs, bowls, plates and vases, glazed in five colours mixed by hand and fired twice in a workshop in India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
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
