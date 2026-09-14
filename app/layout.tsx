import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { WishlistProvider } from "@/components/WishlistContext";
import { CartProvider } from "@/components/CartContext";
import { MugsProvider } from "@/components/MugsContext";
import Loader from "@/components/Loader";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarautile Ceramics - mugs made slowly, on a wheel, by two people",
  description:
    "Wheel-thrown stoneware mugs, glazed in five colours mixed by hand and fired twice in a workshop in India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ff4f1f",
          colorBackground: "#ffffff",
          colorForeground: "#17171a",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" className={`${spaceGrotesk.variable} font-sans`}>
        <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
          <MugsProvider>
            <WishlistProvider>
              <CartProvider>
                <Loader />
                <Header />
                <main className="flex-1">{children}</main>
                <SiteFooter />
                <CartDrawer />
              </CartProvider>
            </WishlistProvider>
          </MugsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
