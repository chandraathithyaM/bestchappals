import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "BestChappals — Premium Footwear | Puliampatti",
  description:
    "Shop premium footwear, sneakers, slides, crocs, ladies heels, and formals at BestChappals. All over India delivery. DM for orders.",
  keywords: "footwear, sneakers, slides, crocs, ladies sandals, chappals, Puliampatti, online shopping",
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
          <meta name="theme-color" content="#ffffff" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ThemeProvider>
            <ToastProvider>
              <SmoothScroll>
                <Navbar />
                <main>{children}</main>
                <CartDrawer />
              </SmoothScroll>
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
