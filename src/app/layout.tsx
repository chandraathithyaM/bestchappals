import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/Toast";
import { ClerkProvider } from "@clerk/nextjs";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "BestChappals — Premium Footwear | Puliampatti",
  description:
    "Shop premium footwear, sneakers, slides, crocs, ladies heels, and formals at BestChappals. All over India delivery. DM for orders.",
  keywords: "footwear, sneakers, slides, crocs, ladies sandals, chappals, Puliampatti, online shopping",
  manifest: "/manifest.json",
  openGraph: {
    title: "BestChappals — Elevate Every Step",
    description: "Premium D2C footwear brand. Shop now for the latest in sneakers, slides, and more.",
    siteName: "BestChappals",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#2563EB" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="BestChappals" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ToastProvider>
            <SmoothScroll>
              <Navbar />
              <main>{children}</main>
              <CartDrawer />
              <PWARegister />
            </SmoothScroll>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
