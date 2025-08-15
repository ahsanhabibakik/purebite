"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Phone,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  X,
  Edit,
  Eye,
  ShoppingBag,
  Star,
  TrendingUp,
  Award,
  Settings,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    area: string;
    city: string;
    phone: string;
  };
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "PB-2024-001",
        date: "2024-01-15",
        status: "delivered",
        total: 450,
        items: [
          {
            id: "1",
            name: "জৈব আম",
            image: "/api/placeholder/100/100",
            quantity: 2,
            price: 120
          },
          {
            id: "2",
            name: "তাজা গাজর",
            image: "/api/placeholder/100/100",
            quantity: 3,
            price: 80
          }
        ],
        shippingAddress: {
          fullName: "মোহাম্মদ রহিম",
          street: "১২৩, গ্রীন রোড",
          area: "ধানমন্ডি",
          city: "ঢাকা",
          phone: "০১৭১১১২৩৪৫৬"
        }
      },
      {
        id: "2",
        orderNumber: "PB-2024-002",
        date: "2024-01-20",
        status: "processing",
        total: 320,
        items: [
          {
            id: "3",
            name: "দুধ",
            image: "/api/placeholder/100/100",
            quantity: 4,
            price: 60
          }
        ],
        shippingAddress: {
          fullName: "মোহাম্মদ রহিম",
          street: "১২৩, গ্রীন রোড",
          area: "ধানমন্ডি",
          city: "ঢাকা",
          phone: "০১৭১১১২৩৪৫৬"
        }
      }
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === "delivered").length,
    pendingOrders: orders.filter(o => o.status === "pending" || o.status === "processing").length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "cancelled": return <X className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "delivered": return "ডেলিভার হয়েছে";
      case "shipped": return "পাঠানো হয়েছে";
      case "processing": return "প্রক্রিয়াধীন";
      case "pending": return "অপেক্ষমাণ";
      case "cancelled": return "বাতিল";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              স্বাগতম, {session?.user?.name || "গ্রাহক"}!
            </h1>
            <p className="text-gray-600">
              আপনার অ্যাকাউন্ট এবং অর্ডার ম্যানেজ করুন
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">মোট অর্ডার</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">সম্পন্ন অর্ডার</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-900">চলমান অর্ডার</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">মোট খরচ</p>
              <p className="text-2xl font-bold text-purple-600">৳{stats.totalSpent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "ওভারভিউ", icon: TrendingUp },
              { id: "orders", label: "অর্ডার", icon: Package },
              { id: "profile", label: "প্রোফাইল", icon: User },
              { id: "addresses", label: "ঠিকানা", icon: MapPin },
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

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">ড্যাশবোর্ড ওভারভিউ</h2>
              
              {/* Recent Orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">সাম্প্রতিক অর্ডার</h3>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="#" onClick={() => setActiveTab("orders")}>
                      সব দেখুন
                    </Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {order.items.length} টি পণ্য
                        </p>
                        <p className="font-semibold text-gray-900">৳{order.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">দ্রুত অ্যাকশন</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button asChild className="h-16 flex-col gap-2">
                    <Link href="/shop">
                      <ShoppingBag className="h-6 w-6" />
                      কেনাকাটা করুন
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-2" asChild>
                    <Link href="/wishlist">
                      <Heart className="h-6 w-6" />
                      উইশলিস্ট
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    সেটিংস
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-2">
                    <Award className="h-6 w-6" />
                    রিওয়ার্ড
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">আমার অর্ডার</h2>
                <Button asChild>
                  <Link href="/shop">নতুন অর্ডার দিন</Link>
                </Button>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.date).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </Badge>
                          <p className="text-lg font-semibold text-gray-900 mt-1">৳{order.total}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="h-12 w-12 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                {item.quantity} × ৳{item.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ৳{item.quantity * item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          ডেলিভারি: {order.shippingAddress.fullName}, {order.shippingAddress.area}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            বিস্তারিত
                          </Button>
                          {order.status === "delivered" && (
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 mr-2" />
                              রিভিউ দিন
                            </Button>
                          )}
                          {(order.status === "pending" || order.status === "processing") && (
                            <Button variant="destructive" size="sm">
                              <X className="h-4 w-4 mr-2" />
                              বাতিল
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">প্রোফাইল তথ্য</h2>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  সম্পাদনা করুন
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পূর্ণ নাম
                    </label>
                    <p className="text-gray-900">{session?.user?.name || "মোহাম্মদ রহিম"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ইমেইল
                    </label>
                    <p className="text-gray-900">{session?.user?.email || "rahim@example.com"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      মোবাইল নম্বর
                    </label>
                    <p className="text-gray-900">০১৭১১১২৩৪৫৬</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      যোগদানের তারিখ
                    </label>
                    <p className="text-gray-900">জানুয়ারি ১৫, ২০২৪</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">আমার ঠিকানা</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ঠিকানা যোগ করুন
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">বাড়ির ঠিকানা</h3>
                      <Badge variant="secondary" className="mt-1">ডিফল্ট</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      মোহাম্মদ রহিম
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      ১২৩, গ্রীন রোড, ধানমন্ডি, ঢাকা-১২০৫
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      ০১৭১১১২৩৪৫৬
                    </p>
                  </div>
                </div>

                <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                  <MapPin className="h-8 w-8 mb-2" />
                  <p className="text-sm">নতুন ঠিকানা যোগ করুন</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    যোগ করুন
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}