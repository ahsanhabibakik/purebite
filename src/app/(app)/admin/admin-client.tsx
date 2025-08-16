"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  Shield, 
  BarChart3, 
  Bell,
  Settings,
  MessageSquare,
  TrendingUp,
  Briefcase,
  Star,
  FileText,
  Target
} from "lucide-react";
import Link from "next/link";
import { NotificationSystem } from "@/components/notifications/NotificationSystem";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { CustomerManagement } from "@/components/customers/CustomerManagement";

export function AdminClient() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

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
      {/* Header with Notifications */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-600">PureBite ব্যবসা পরিচালনা করুন</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationSystem />
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            সেটিংস
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "ওভারভিউ", icon: TrendingUp },
              { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
              { id: "inventory", label: "ইনভেন্টরি", icon: Package },
              { id: "customers", label: "গ্রাহক", icon: Users },
              { id: "orders", label: "অর্ডার", icon: ShoppingCart },
              { id: "marketing", label: "মার্কেটিং", icon: Target },
              { id: "reports", label: "রিপোর্ট", icon: FileText },
              { id: "support", label: "সাপোর্ট", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">মোট অর্ডার</h3>
                    <p className="text-2xl font-bold text-blue-600">১৫৬</p>
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
                    <p className="text-2xl font-bold text-green-600">৳১,২৫,০০০</p>
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
                    <p className="text-2xl font-bold text-purple-600">৮৯</p>
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
                    <p className="text-2xl font-bold text-orange-600">৪৫</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">দ্রুত অ্যাকশন</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={() => setActiveTab("orders")} className="h-20 flex flex-col">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  অর্ডার দেখুন
                </Button>
                <Button onClick={() => setActiveTab("inventory")} variant="outline" className="h-20 flex flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  ইনভেন্টরি
                </Button>
                <Button onClick={() => setActiveTab("customers")} variant="outline" className="h-20 flex flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  গ্রাহক
                </Button>
                <Button onClick={() => setActiveTab("analytics")} variant="outline" className="h-20 flex flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  অ্যানালিটিক্স
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && <AdvancedAnalytics />}
        {activeTab === "inventory" && <InventoryManagement />}
        {activeTab === "customers" && <CustomerManagement />}
        
        {activeTab === "orders" && (
          <div className="bg-white p-8 rounded-lg border text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">অর্ডার ম্যানেজমেন্ট</h3>
            <p className="text-gray-600 mb-6">অর্ডার ম্যানেজমেন্ট সিস্টেম শীঘ্রই আসছে...</p>
            <Button asChild>
              <Link href="/admin/orders/tracking">
                বর্তমান অর্ডার ট্র্যাকিং দেখুন
              </Link>
            </Button>
          </div>
        )}

        {activeTab === "marketing" && (
          <div className="bg-white p-8 rounded-lg border text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">মার্কেটিং টুলস</h3>
            <p className="text-gray-600 mb-6">ক্যাম্পেইন ম্যানেজমেন্ট ও মার্কেটিং টুলস আসছে...</p>
            <Button asChild>
              <Link href="/admin/coupons">
                কুপন ম্যানেজমেন্ট দেখুন
              </Link>
            </Button>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white p-8 rounded-lg border text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">রিপোর্ট ও এক্সপোর্ট</h3>
            <p className="text-gray-600 mb-6">ব্যাপক রিপোর্টিং সিস্টেম তৈরি করা হচ্ছে...</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline">বিক্রয় রিপোর্ট</Button>
              <Button variant="outline">গ্রাহক রিপোর্ট</Button>
              <Button variant="outline">ইনভেন্টরি রিপোর্ট</Button>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="bg-white p-8 rounded-lg border text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">গ্রাহক সাপোর্ট</h3>
            <p className="text-gray-600 mb-6">টিকেট সিস্টেম ও লাইভ চ্যাট সাপোর্ট আসছে...</p>
            <Button asChild>
              <Link href="/admin/chat">
                চ্যাট সাপোর্ট দেখুন
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}