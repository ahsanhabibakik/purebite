import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'পণ্য - পিওরবাইট',
  description: 'স্বাস্থ্যকর ও পুষ্টিকর খাবারের বিশাল সংগ্রহ',
}

export const dynamic = 'force-dynamic';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}