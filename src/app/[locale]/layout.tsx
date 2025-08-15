import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import ChatWidget from "@/components/chat/ChatWidget";
import { AuthProvider } from "@/components/AuthProvider";
import { ClientProviders } from "@/components/ClientProviders";
import { locales, type Locale, localeNames } from '@/i18n/config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: {
      template: `%s | PureBite`,
      default: "PureBite - স্বাস্থ্যকর খাবারের বিশ্বস্ত ঠিকানা"
    },
    description: locale === 'bn' 
      ? "হোমমেড, অর্গানিক ও পুষ্টিকর খাবারের সংগ্রহ। আপনার পরিবারের স্বাস্থ্যের জন্য সেরা মানের পণ্য।"
      : "Homemade, organic & nutritious food collection. Best quality products for your family's health.",
    keywords: locale === 'bn'
      ? "স্বাস্থ্যকর খাবার, অর্গানিক, পুষ্টিকর, হোমমেড, অনলাইন শপিং"
      : "healthy food, organic, nutritious, homemade, online shopping",
    authors: [{ name: "PureBite" }],
    creator: "PureBite",
    publisher: "PureBite",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://purebite.vercel.app'),
    alternates: {
      canonical: '/',
      languages: {
        'bn': '/bn',
        'en': '/en',
      },
    },
    openGraph: {
      title: 'PureBite - স্বাস্থ্যকর খাবারের বিশ্বস্ত ঠিকানা',
      description: locale === 'bn' 
        ? "হোমমেড, অর্গানিক ও পুষ্টিকর খাবারের সংগ্রহ। আপনার পরিবারের স্বাস্থ্যের জন্য সেরা মানের পণ্য।"
        : "Homemade, organic & nutritious food collection. Best quality products for your family's health.",
      type: 'website',
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      url: 'https://purebite.vercel.app',
      siteName: 'PureBite',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'PureBite - স্বাস্থ্যকর খাবারের বিশ্বস্ত ঠিকানা',
      description: locale === 'bn' 
        ? "হোমমেড, অর্গানিক ও পুষ্টিকর খাবারের সংগ্রহ"
        : "Homemade, organic & nutritious food collection",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSidebar />
        <ChatWidget />
        <ClientProviders />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}