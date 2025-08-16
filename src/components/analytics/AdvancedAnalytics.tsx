"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down';
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down';
  };
  customers: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down';
  };
  products: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down';
  };
  salesData: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    quantity: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'customer' | 'product' | 'review';
    message: string;
    timestamp: Date;
    amount?: number;
  }>;
}

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      const mockData: AnalyticsData = {
        revenue: {
          current: 125000,
          previous: 98000,
          growth: 27.5,
          trend: 'up'
        },
        orders: {
          current: 156,
          previous: 142,
          growth: 9.9,
          trend: 'up'
        },
        customers: {
          current: 89,
          previous: 76,
          growth: 17.1,
          trend: 'up'
        },
        products: {
          current: 45,
          previous: 41,
          growth: 9.8,
          trend: 'up'
        },
        salesData: [
          { date: '২০২৪-০১-০১', sales: 15000, orders: 25 },
          { date: '২০২৪-০১-০২', sales: 18000, orders: 32 },
          { date: '২০২৪-০১-০৩', sales: 22000, orders: 28 },
          { date: '২০২৪-০১-০৪', sales: 19000, orders: 31 },
          { date: '২০২৪-০১-০৫', sales: 25000, orders: 35 },
          { date: '২০২৪-০১-০৬', sales: 21000, orders: 29 },
          { date: '২০২৪-০১-০৭', sales: 23000, orders: 33 }
        ],
        topProducts: [
          { id: '1', name: 'জৈব আম', sales: 450, quantity: 89, revenue: 12500 },
          { id: '2', name: 'খেজুর বাদাম হালুয়া', sales: 380, quantity: 76, revenue: 11200 },
          { id: '3', name: 'তাজা গাজর', sales: 320, quantity: 120, revenue: 8900 },
          { id: '4', name: 'কাঁচা হলুদ', sales: 290, quantity: 95, revenue: 7800 },
          { id: '5', name: 'দেশি মুরগির ডিম', sales: 250, quantity: 150, revenue: 6500 }
        ],
        customerSegments: [
          { segment: 'নিয়মিত গ্রাহক', count: 45, percentage: 50.6, color: '#10B981' },
          { segment: 'নতুন গ্রাহক', count: 28, percentage: 31.5, color: '#3B82F6' },
          { segment: 'VIP গ্রাহক', count: 12, percentage: 13.5, color: '#8B5CF6' },
          { segment: 'নিষ্ক্রিয় গ্রাহক', count: 4, percentage: 4.5, color: '#EF4444' }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'order',
            message: 'নতুন অর্ডার #PB-2024-156 - মোহাম্মদ করিম',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            amount: 850
          },
          {
            id: '2',
            type: 'customer',
            message: 'নতুন গ্রাহক নিবন্ধন - ফাতেমা খাতুন',
            timestamp: new Date(Date.now() - 15 * 60 * 1000)
          },
          {
            id: '3',
            type: 'review',
            message: 'জৈব আম - ৫ স্টার রিভিউ পেয়েছে',
            timestamp: new Date(Date.now() - 25 * 60 * 1000)
          },
          {
            id: '4',
            type: 'order',
            message: 'অর্ডার #PB-2024-155 ডেলিভার হয়েছে',
            timestamp: new Date(Date.now() - 35 * 60 * 1000),
            amount: 1200
          },
          {
            id: '5',
            type: 'product',
            message: 'খেজুর বাদাম হালুয়া স্টক আপডেট',
            timestamp: new Date(Date.now() - 45 * 60 * 1000)
          }
        ]
      };
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  const formatNumber = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "এইমাত্র";
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    return `${hours} ঘন্টা আগে`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">অ্যানালিটিক্স লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
          <p className="text-gray-600">ব্যবসার পারফরম্যান্স ও পরিসংখ্যান</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">গত ৭ দিন</option>
            <option value="30d">গত ৩০ দিন</option>
            <option value="90d">গত ৯০ দিন</option>
            <option value="1y">গত ১ বছর</option>
          </select>
          
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <Badge variant={data.revenue.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {data.revenue.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.revenue.growth}%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">৳{formatNumber(data.revenue.current)}</h3>
          <p className="text-sm text-gray-600">মোট বিক্রয়</p>
          <p className="text-xs text-gray-500 mt-1">
            পূর্ববর্তী: ৳{formatNumber(data.revenue.previous)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <Badge variant={data.orders.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {data.orders.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.orders.growth}%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.orders.current}</h3>
          <p className="text-sm text-gray-600">মোট অর্ডার</p>
          <p className="text-xs text-gray-500 mt-1">
            পূর্ববর্তী: {data.orders.previous}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <Badge variant={data.customers.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {data.customers.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.customers.growth}%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.customers.current}</h3>
          <p className="text-sm text-gray-600">মোট গ্রাহক</p>
          <p className="text-xs text-gray-500 mt-1">
            পূর্ববর্তী: {data.customers.previous}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <Badge variant={data.products.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {data.products.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.products.growth}%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.products.current}</h3>
          <p className="text-sm text-gray-600">মোট পণ্য</p>
          <p className="text-xs text-gray-500 mt-1">
            পূর্ববর্তী: {data.products.previous}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">বিক্রয়ের ট্রেন্ড</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {data.salesData.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-xs text-gray-600">
                  {item.date.split('-')[2]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="bg-green-500 h-4 rounded"
                      style={{ width: `${(item.sales / 25000) * 100}%` }}
                    />
                    <span className="text-sm font-medium">৳{formatNumber(item.sales)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="bg-blue-400 h-2 rounded"
                      style={{ width: `${(item.orders / 35) * 100}%` }}
                    />
                    <span className="text-xs text-gray-600">{item.orders} অর্ডার</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">গ্রাহক বিভাগ</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.customerSegments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-gray-700">{segment.segment}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{segment.count}</div>
                  <div className="text-xs text-gray-500">{segment.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">সর্বোচ্চ বিক্রিত পণ্য</h2>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-xs text-gray-600">{product.quantity} বিক্রি</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">৳{formatNumber(product.revenue)}</div>
                  <div className="text-xs text-gray-500">{product.sales} অর্ডার</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">সাম্প্রতিক কার্যক্রম</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-1 rounded-full ${
                  activity.type === 'order' ? 'bg-green-100' :
                  activity.type === 'customer' ? 'bg-blue-100' :
                  activity.type === 'product' ? 'bg-orange-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'order' && <ShoppingCart className="h-3 w-3 text-green-600" />}
                  {activity.type === 'customer' && <Users className="h-3 w-3 text-blue-600" />}
                  {activity.type === 'product' && <Package className="h-3 w-3 text-orange-600" />}
                  {activity.type === 'review' && <Activity className="h-3 w-3 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                    {activity.amount && (
                      <p className="text-xs font-medium text-green-600">৳{activity.amount}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}