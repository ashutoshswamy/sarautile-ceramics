import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Loader from "@/components/Loader";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarautile Ceramics — mugs made slowly, on a wheel, by two people",
  description:
    "Wheel-thrown stoneware mugs, glazed in five colours mixed by hand and fired twice in a workshop in India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} font-sans`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
        <CartProvider>
          <Loader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
