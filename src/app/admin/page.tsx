"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  MessageCircle,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "PB-2024-001",
        customerName: "জামিল আহমেদ",
        customerEmail: "jamil@example.com",
        total: 580,
        status: "pending",
        items: 3,
        shippingAddress: "ঢাকা, বাংলাদেশ",
        paymentMethod: "SSLCommerz",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        orderNumber: "PB-2024-002",
        customerName: "ফাতিমা খান",
        customerEmail: "fatima@example.com",
        total: 320,
        status: "confirmed",
        items: 2,
        shippingAddress: "চট্টগ্রাম, বাংলাদেশ",
        paymentMethod: "Stripe",
        createdAt: "2024-01-14T15:45:00Z",
        updatedAt: "2024-01-15T09:20:00Z"
      },
      {
        id: "3",
        orderNumber: "PB-2024-003",
        customerName: "রহিম উদ্দিন",
        customerEmail: "rahim@example.com",
        total: 750,
        status: "processing",
        items: 5,
        shippingAddress: "সিলেট, বাংলাদেশ",
        paymentMethod: "SSLCommerz",
        createdAt: "2024-01-14T11:20:00Z",
        updatedAt: "2024-01-15T08:15:00Z"
      },
      {
        id: "4",
        orderNumber: "PB-2024-004",
        customerName: "সালমা বেগম",
        customerEmail: "salma@example.com",
        total: 420,
        status: "shipped",
        items: 4,
        shippingAddress: "রাজশাহী, বাংলাদেশ",
        paymentMethod: "Stripe",
        createdAt: "2024-01-13T14:30:00Z",
        updatedAt: "2024-01-14T16:45:00Z"
      },
      {
        id: "5",
        orderNumber: "PB-2024-005",
        customerName: "করিম মিয়া",
        customerEmail: "karim@example.com",
        total: 280,
        status: "delivered",
        items: 2,
        shippingAddress: "খুলনা, বাংলাদেশ",
        paymentMethod: "SSLCommerz",
        createdAt: "2024-01-12T09:15:00Z",
        updatedAt: "2024-01-14T12:30:00Z"
      }
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === "pending").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalCustomers: new Set(orders.map(o => o.customerEmail)).size,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <RefreshCw className="h-4 w-4" />;
      case "shipped": return <Package className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "default";
      case "confirmed": return "default";
      case "processing": return "default";
      case "shipped": return "default";
      case "delivered": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your orders, products, and customers</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-900">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">৳{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Total Customers</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Link href="/admin/products">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Package className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, and manage your product catalog</p>
          </div>
        </Link>
        <Link href="/admin/inventory">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Package className="h-8 w-8 text-orange-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Inventory Management</h3>
            <p className="text-sm text-gray-600">Monitor stock levels and manage inventory</p>
          </div>
        </Link>
        <Link href="/admin/chat">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <MessageCircle className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Customer Support</h3>
            <p className="text-sm text-gray-600">Manage customer chat conversations</p>
          </div>
        </Link>
        <Link href="/admin/orders/tracking">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Truck className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Order Tracking</h3>
            <p className="text-sm text-gray-600">Manage shipping and delivery tracking</p>
          </div>
        </Link>
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
          <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
          <p className="text-sm text-gray-600">View sales reports and analytics</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items} items
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={getStatusColor(order.status) as "default" | "destructive" | "outline" | "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ৳{order.total}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log("View order:", order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {order.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {order.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {order.status === "processing" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}