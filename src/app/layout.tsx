import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { LiveChat } from "@/components/LiveChat";
import { AuthProvider } from "@/components/AuthProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTagManager, { GoogleTagManagerNoScript } from "@/components/GoogleTagManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PureBite",
  description: "Your one-stop shop for pure and healthy products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager - positioned as high in head as possible */}
        <GoogleTagManager />
        {/* Google Analytics 4 - immediately after GTM */}
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        {/* Google Tag Manager (noscript) - immediately after opening body tag */}
        <GoogleTagManagerNoScript />
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSidebar />
          <LiveChat />
        </AuthProvider>
      </body>
    </html>
  );
}
