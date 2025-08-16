"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shipping: number;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      image: string;
    };
  }>;
}

export default function AccountOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/orders?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "অপেক্ষমাণ", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      CONFIRMED: { label: "নিশ্চিত", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      PROCESSING: { label: "প্রস্তুতি", color: "bg-purple-100 text-purple-800", icon: Package },
      SHIPPED: { label: "পাঠানো হয়েছে", color: "bg-indigo-100 text-indigo-800", icon: Truck },
      DELIVERED: { label: "ডেলিভার", color: "bg-green-100 text-green-800", icon: CheckCircle },
      CANCELLED: { label: "বাতিল", color: "bg-red-100 text-red-800", icon: XCircle },
      PENDING_PAYMENT: { label: "পেমেন্ট অপেক্ষমাণ", color: "bg-orange-100 text-orange-800", icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'CASH_ON_DELIVERY': 'ক্যাশ অন ডেলিভারি',
      'MOBILE_BANKING': 'মোবাইল ব্যাংকিং',
      'BANK_TRANSFER': 'ব্যাংক ট্রান্সফার',
      'SSLCOMMERZ': 'অনলাইন পেমেন্ট',
      'online_payment': 'অনলাইন পেমেন্ট',
      'mobile_banking': 'মোবাইল ব্যাংকিং',
      'bank_transfer': 'ব্যাংক ট্রান্সফার',
      'cash_on_delivery': 'ক্যাশ অন ডেলিভারি'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">লগইন প্রয়োজন</h1>
        <p className="text-gray-600 mb-6">আপনার অর্ডার দেখতে লগইন করুন।</p>
        <Button asChild>
          <Link href="/api/auth/signin">লগইন করুন</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          আমার অর্ডার ({filteredOrders.length} টি)
        </h1>
        
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="ফিল্টার করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব অর্ডার</SelectItem>
              <SelectItem value="PENDING">অপেক্ষমাণ</SelectItem>
              <SelectItem value="CONFIRMED">নিশ্চিত</SelectItem>
              <SelectItem value="PROCESSING">প্রস্তুতি</SelectItem>
              <SelectItem value="SHIPPED">পাঠানো হয়েছে</SelectItem>
              <SelectItem value="DELIVERED">ডেলিভার</SelectItem>
              <SelectItem value="CANCELLED">বাতিল</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "all" ? "কোন অর্ডার নেই" : "এই ফিল্টারে কোন অর্ডার নেই"}
          </h2>
          <p className="text-gray-600 mb-6">
            {filter === "all" 
              ? "আপনার প্রথম অর্ডার দিন এবং আমাদের সেবা উপভোগ করুন।"
              : "অন্য ফিল্টার ব্যবহার করে দেখুন বা নতুন অর্ডার দিন।"
            }
          </p>
          <Button asChild>
            <Link href="/bn/shop">
              কেনাকাটা শুরু করুন
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        অর্ডার #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ৳{order.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/bn/account/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        বিস্তারিত
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          পরিমাণ: {item.quantity} × ৳{item.price.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ৳{(item.quantity * item.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {order.items.length > 3 && (
                    <div className="text-center text-sm text-gray-600 pt-2 border-t">
                      আরও {order.items.length - 3} টি পণ্য...
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">সাবটোটাল:</span>
                    <span>৳{order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ডেলিভারি:</span>
                      <span>৳{order.shipping}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>মোট:</span>
                    <span className="text-green-600">৳{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/bn/account/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      বিস্তারিত দেখুন
                    </Link>
                  </Button>
                  
                  {order.status === 'DELIVERED' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      ইনভয়েস ডাউনলোড
                    </Button>
                  )}
                  
                  {['PENDING', 'CONFIRMED'].includes(order.status) && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      অর্ডার বাতিল
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/bn/shop">
                      আবার অর্ডার করুন
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          অর্ডার নিয়ে কোন সমস্যা?
        </h2>
        <p className="text-blue-700 mb-4">
          আমাদের সাপোর্ট টিম আপনাকে সাহায্য করতে প্রস্তুত
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/bn/contact">
              যোগাযোগ করুন
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="tel:01700000000">
              ফোন করুন: ০১৭০০০০০০০০
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}