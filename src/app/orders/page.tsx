"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  Eye,
  MapPin,
  Calendar,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock order data
const mockOrders = [
  {
    id: "ORD-001",
    date: "২০২৪-০১-১৫",
    status: "delivered",
    total: 850,
    items: [
      {
        id: "1",
        name: "খেজুর বাদাম হালুয়া",
        quantity: 2,
        price: 350,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100"
      },
      {
        id: "4",
        name: "প্রিমিয়াম কাজু বাদাম",
        quantity: 1,
        price: 150,
        image: "https://images.unsplash.com/photo-1568096889942-6eedde686635?w=100"
      }
    ],
    shippingAddress: "ধানমন্ডি, ঢাকা",
    trackingSteps: [
      { status: "confirmed", label: "অর্ডার নিশ্চিত", date: "২০২৪-০১-১৫ ১০:৩০", completed: true },
      { status: "processing", label: "প্রস্তুতি চলছে", date: "২০২৪-০১-১৫ ১৪:১৫", completed: true },
      { status: "shipped", label: "পাঠানো হয়েছে", date: "২০২৪-০১-১৬ ০৯:০০", completed: true },
      { status: "delivered", label: "ডেলিভার সম্পন্ন", date: "২০২৪-০১-১৬ ১৮:৩০", completed: true }
    ]
  },
  {
    id: "ORD-002",
    date: "২০২৪-০১-১২",
    status: "shipped",
    total: 650,
    items: [
      {
        id: "2",
        name: "পুষ্টিকর তিলের লাড্ডু",
        quantity: 1,
        price: 250,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100"
      },
      {
        id: "3",
        name: "এনার্জি বল (ডেট বাইটস)",
        quantity: 1,
        price: 400,
        image: "https://images.unsplash.com/photo-1571197119382-5d52d10e5ed8?w=100"
      }
    ],
    shippingAddress: "উত্তরা, ঢাকা",
    trackingSteps: [
      { status: "confirmed", label: "অর্ডার নিশ্চিত", date: "২০২৪-০১-১২ ১১:২০", completed: true },
      { status: "processing", label: "প্রস্তুতি চলছে", date: "২০২৪-০১-১২ ১৬:৪৫", completed: true },
      { status: "shipped", label: "পাঠানো হয়েছে", date: "২০২৪-০১-১৩ ০৮:৩০", completed: true },
      { status: "delivered", label: "ডেলিভার সম্পন্ন", date: "", completed: false }
    ]
  }
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800", 
  shipped: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  confirmed: "নিশ্চিত",
  processing: "প্রস্তুতি চলছে",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার সম্পন্ন",
  cancelled: "বাতিল"
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [orders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, fetch user's orders from API
    if (isAuthenticated && user) {
      // setOrders(fetchUserOrders(user.id));
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">অর্ডার দেখতে লগইন করুন</h1>
        <p className="text-gray-600 mb-6">
          আপনার অর্ডারের তথ্য দেখতে প্রথমে লগইন করুন
        </p>
        <Button asChild>
          <Link href="/">হোমে ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.includes(searchTerm))
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">আমার অর্ডার</h1>
        <p className="text-gray-600">আপনার সকল অর্ডারের তথ্য এখানে দেখুন</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Label htmlFor="search">অর্ডার অনুসন্ধান</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="অর্ডার নম্বর বা পণ্যের নাম লিখুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন অর্ডার পাওয়া যায়নি</h3>
            <p className="text-gray-500">
              {searchTerm ? "আপনার অনুসন্ধানের সাথে কোন অর্ডার মিলেনি" : "এখনো কোন অর্ডার করেননি"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/shop">এখনই শপিং করুন</Link>
            </Button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg shadow-sm">
              {/* Order Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">অর্ডার #{order.id}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {order.shippingAddress}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {getStatusIcon(order.status)}
                      {statusLabels[order.status]}
                    </div>
                    <div className="text-lg font-bold mt-2">৳{order.total}</div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {selectedOrder === order.id ? "বিস্তারিত লুকান" : "বিস্তারিত দেখুন"}
                </Button>
              </div>

              {/* Order Details */}
              {selectedOrder === order.id && (
                <div className="p-6">
                  {/* Items */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">অর্ডারকৃত পণ্য</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">৳{item.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking */}
                  <div>
                    <h4 className="font-medium mb-3">অর্ডার ট্র্যাকিং</h4>
                    <div className="space-y-4">
                      {order.trackingSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                            step.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${step.completed ? "text-green-600" : "text-gray-400"}`}>
                              {step.label}
                            </div>
                            {step.date && (
                              <div className="text-sm text-gray-500">{step.date}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}