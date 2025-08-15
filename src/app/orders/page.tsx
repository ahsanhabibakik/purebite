"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Package, Eye, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">অর্ডার দেখতে লগইন করুন</h2>
          <p className="text-gray-600 mb-6">
            আপনার অর্ডারের তালিকা দেখতে প্রথমে লগইন করুন
          </p>
          <Button asChild>
            <Link href="/api/auth/signin">লগইন করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">কোনো অর্ডার নেই</h2>
          <p className="text-gray-600 mb-6">
            আপনি এখনও কোনো অর্ডার করেননি
          </p>
          <Button asChild>
            <Link href="/shop">কেনাকাটা শুরু করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'অপেক্ষমাণ', color: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'নিশ্চিত', color: 'bg-blue-100 text-blue-800' },
      'processing': { label: 'প্রস্তুত হচ্ছে', color: 'bg-purple-100 text-purple-800' },
      'shipped': { label: 'পাঠানো হয়েছে', color: 'bg-indigo-100 text-indigo-800' },
      'delivered': { label: 'ডেলিভার হয়েছে', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'বাতিল', color: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">আমার অর্ডার</h1>
        <p className="text-gray-600">{orders.length}টি অর্ডার</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">অর্ডার #{order.id}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-2">{getStatusBadge(order.status)}</div>
                <p className="font-semibold">৳{order.total}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">পণ্যসমূহ:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.quantity} = ৳{item.price * item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/${order.id}/tracking`}>
                  <Eye className="h-4 w-4 mr-2" />
                  বিস্তারিত দেখুন
                </Link>
              </Button>
              {(order.status === 'shipped' || order.status === 'delivered') && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/${order.id}/tracking`}>
                    <Truck className="h-4 w-4 mr-2" />
                    ট্র্যাক করুন
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}