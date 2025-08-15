"use client";

export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Users, DollarSign, Shield } from "lucide-react";
import Link from "next/link";

export function AdminClient() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">অ্যাক্সেস নিষেধ</h1>
        <p className="text-gray-600 mb-6">
          এই পেইজটি শুধুমাত্র অ্যাডমিনদের জন্য।
        </p>
        <Button asChild>
          <Link href="/">হোমে ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="text-gray-600">PureBite ব্যবসা পরিচালনা করুন</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">মোট অর্ডার</h3>
              <p className="text-2xl font-bold text-blue-600">১২৫</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">মোট বিক্রয়</h3>
              <p className="text-2xl font-bold text-green-600">৳৮৫,৫০০</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">মোট গ্রাহক</h3>
              <p className="text-2xl font-bold text-purple-600">৪৮</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">মোট পণ্য</h3>
              <p className="text-2xl font-bold text-orange-600">৩২</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">দ্রুত অ্যাকশন</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild className="h-20 flex flex-col">
            <Link href="/admin/orders">
              <ShoppingCart className="h-8 w-8 mb-2" />
              অর্ডার দেখুন
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex flex-col">
            <Link href="/admin/products">
              <Package className="h-8 w-8 mb-2" />
              পণ্য পরিচালনা
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex flex-col">
            <Link href="/admin/customers">
              <Users className="h-8 w-8 mb-2" />
              গ্রাহক তালিকা
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex flex-col">
            <Link href="/admin/analytics">
              <DollarSign className="h-8 w-8 mb-2" />
              অ্যানালিটিক্স
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}