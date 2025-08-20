"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Calendar,
  Star,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    productGrowth: number;
  };
  salesData: {
    daily: { date: string; revenue: number; orders: number }[];
    monthly: { month: string; revenue: number; orders: number }[];
    topProducts: { id: string; name: string; sales: number; revenue: number }[];
    topCategories: { category: string; sales: number; revenue: number }[];
  };
  customerData: {
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
    averageOrderValue: number;
    customerRetentionRate: number;
  };
  inventoryData: {
    lowStockProducts: { id: string; name: string; stock: number; reorderLevel: number }[];
    outOfStockProducts: { id: string; name: string }[];
    totalStockValue: number;
    fastMovingProducts: { id: string; name: string; velocity: number }[];
  };
  performanceMetrics: {
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    pageViews: number;
    uniqueVisitors: number;
  };
}

export function ComprehensiveDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?range=${selectedTimeRange}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">ডাটা লোড করতে সমস্যা হয়েছে</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ব্যাপক বিশ্লেষণ ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার ব্যবসার সম্পূর্ণ পরিসংখ্যান ও অন্তর্দৃষ্টি</p>
        </div>
        
        <div className="flex gap-2">
          {[
            { label: '৭ দিন', value: '7d' },
            { label: '৩০ দিন', value: '30d' },
            { label: '৯০ দিন', value: '90d' },
            { label: '১ বছর', value: '1y' }
          ].map(option => (
            <Button
              key={option.value}
              variant={selectedTimeRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">মোট আয়</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.overview.totalRevenue)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dashboardData.overview.revenueGrowth)}`}>
                {getGrowthIcon(dashboardData.overview.revenueGrowth)}
                <span>{Math.abs(dashboardData.overview.revenueGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">মোট অর্ডার</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(dashboardData.overview.totalOrders)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dashboardData.overview.orderGrowth)}`}>
                {getGrowthIcon(dashboardData.overview.orderGrowth)}
                <span>{Math.abs(dashboardData.overview.orderGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-purple-200 bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">মোট গ্রাহক</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(dashboardData.overview.totalCustomers)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dashboardData.overview.customerGrowth)}`}>
                {getGrowthIcon(dashboardData.overview.customerGrowth)}
                <span>{Math.abs(dashboardData.overview.customerGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-900">মোট পণ্য</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatNumber(dashboardData.overview.totalProducts)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dashboardData.overview.productGrowth)}`}>
                {getGrowthIcon(dashboardData.overview.productGrowth)}
                <span>{Math.abs(dashboardData.overview.productGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">আয় ও অর্ডার ট্রেন্ড</h3>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'revenue' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric('revenue')}
              >
                আয়
              </Button>
              <Button
                variant={selectedMetric === 'orders' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric('orders')}
              >
                অর্ডার
              </Button>
            </div>
          </div>
          
          {/* Simple Chart Placeholder */}
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">চার্ট ডাটা</p>
              <p className="text-sm text-gray-500">
                {selectedMetric === 'revenue' ? 'আয়ের' : 'অর্ডারের'} ট্রেন্ড চার্ট
              </p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">শীর্ষ বিক্রিত পণ্য</h3>
          <div className="space-y-3">
            {dashboardData.salesData.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{formatNumber(product.sales)} টি বিক্রি</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Metrics */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">গ্রাহক পরিসংখ্যান</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(dashboardData.customerData.newCustomers)}
              </p>
              <p className="text-sm text-blue-800">নতুন গ্রাহক</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(dashboardData.customerData.returningCustomers)}
              </p>
              <p className="text-sm text-green-800">ফিরে আসা গ্রাহক</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(dashboardData.customerData.averageOrderValue)}
              </p>
              <p className="text-sm text-purple-800">গড় অর্ডার মূল্য</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData.customerData.customerRetentionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-orange-800">গ্রাহক ধরে রাখার হার</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">ওয়েবসাইট পারফরম্যান্স</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">রূপান্তর হার</span>
              <span className="font-bold text-green-600">
                {dashboardData.performanceMetrics.conversionRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">বাউন্স রেট</span>
              <span className="font-bold text-red-600">
                {dashboardData.performanceMetrics.bounceRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">পৃষ্ঠা ভিউ</span>
              <span className="font-bold text-blue-600">
                {formatNumber(dashboardData.performanceMetrics.pageViews)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">অনন্য দর্শক</span>
              <span className="font-bold text-purple-600">
                {formatNumber(dashboardData.performanceMetrics.uniqueVisitors)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts */}
      {(dashboardData.inventoryData.lowStockProducts.length > 0 || 
        dashboardData.inventoryData.outOfStockProducts.length > 0) && (
        <div className="bg-white p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">ইনভেন্টরি সতর্কতা</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.inventoryData.lowStockProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-900 mb-2">কম স্টক</h4>
                <div className="space-y-2">
                  {dashboardData.inventoryData.lowStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm">{product.name}</span>
                      <Badge variant="destructive">{product.stock} টি বাকি</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {dashboardData.inventoryData.outOfStockProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 mb-2">স্টক শেষ</h4>
                <div className="space-y-2">
                  {dashboardData.inventoryData.outOfStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm">{product.name}</span>
                      <Badge variant="destructive">স্টক নেই</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}