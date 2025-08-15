'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Eye, 
  AlertTriangle,
  Clock,
  Target,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardData {
  overview: {
    pageViews: {
      today: number;
      yesterday: number;
      week: number;
      change: number;
    };
    orders: {
      today: number;
      week: number;
    };
    errors: {
      today: number;
    };
  };
  pageViews: Array<{
    date: string;
    count: number;
  }>;
  topProducts: Array<{
    productId: string;
    views: number;
    product?: {
      id: string;
      name: string;
      price: number;
      image: string;
    };
  }>;
  conversionFunnel: {
    productViews: number;
    addToCarts: number;
    checkoutStarts: number;
    purchases: number;
  };
  conversionRates: {
    viewToCart: number;
    cartToCheckout: number;
    checkoutToPurchase: number;
    overallConversion: number;
  };
  performanceMetrics: {
    averagePageLoadTime: number;
    averageFCP: number;
    averageLCP: number;
    averageCLS: number;
    averageFID: number;
    totalSamples: number;
  };
  recentErrors: Array<{
    message: string;
    url?: string;
    timestamp: string;
    userAgent?: string;
  }>;
  period: string;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [session, status, period]);

  const fetchDashboardData = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/analytics/dashboard?period=${period}`);
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ড্যাশবোর্ড ডেটা লোড করতে সমস্যা
          </h3>
          <Button onClick={() => fetchDashboardData()}>আবার চেষ্টা করুন</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
            <p className="text-gray-600">ওয়েবসাইট পারফরমেন্স ও ব্যবহারকারী আচরণের বিশ্লেষণ</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="1d">আজ</option>
              <option value="7d">গত ৭ দিন</option>
              <option value="30d">গত ৩০ দিন</option>
              <option value="90d">গত ৯০ দিন</option>
            </select>

            {/* Refresh Button */}
            <Button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ভিউ</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.pageViews.today)}</div>
            <p className={`text-xs ${data.overview.pageViews.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.overview.pageViews.change >= 0 ? '+' : ''}{formatPercentage(data.overview.pageViews.change)} গতকাল থেকে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">এই সপ্তাহের ভিউ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.pageViews.week)}</div>
            <p className="text-xs text-muted-foreground">
              গত ৭ দিনে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের অর্ডার</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.orders.today}</div>
            <p className="text-xs text-muted-foreground">
              এই সপ্তাহে মোট: {data.overview.orders.week}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ত্রুটি</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.errors.today}</div>
            <p className="text-xs text-muted-foreground">
              গত ২৤ ঘন্টায়
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              কনভার্শন ফানেল
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">পণ্য ভিউ</span>
                <span className="font-medium">{formatNumber(data.conversionFunnel.productViews)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">কার্টে যোগ</span>
                <div className="text-right">
                  <span className="font-medium">{formatNumber(data.conversionFunnel.addToCarts)}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formatPercentage(data.conversionRates.viewToCart)})
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">চেকআউট শুরু</span>
                <div className="text-right">
                  <span className="font-medium">{formatNumber(data.conversionFunnel.checkoutStarts)}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formatPercentage(data.conversionRates.cartToCheckout)})
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">সম্পূর্ণ ক্রয়</span>
                <div className="text-right">
                  <span className="font-medium">{formatNumber(data.conversionFunnel.purchases)}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formatPercentage(data.conversionRates.checkoutToPurchase)})
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">সামগ্রিক কনভার্শন রেট</span>
                  <span className="font-bold text-green-600">
                    {formatPercentage(data.conversionRates.overallConversion)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              পারফরমেন্স মেট্রিক্স
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">গড় পেজ লোড টাইম</span>
                <span className="font-medium">
                  {formatDuration(data.performanceMetrics.averagePageLoadTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">First Contentful Paint</span>
                <span className="font-medium">
                  {formatDuration(data.performanceMetrics.averageFCP)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Largest Contentful Paint</span>
                <span className="font-medium">
                  {formatDuration(data.performanceMetrics.averageLCP)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cumulative Layout Shift</span>
                <span className="font-medium">
                  {data.performanceMetrics.averageCLS.toFixed(3)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">First Input Delay</span>
                <span className="font-medium">
                  {formatDuration(data.performanceMetrics.averageFID)}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">মোট স্যাম্পল</span>
                  <span className="font-medium">{data.performanceMetrics.totalSamples}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              জনপ্রিয় পণ্যসমূহ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((item, index) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {item.product?.name || `Product ${item.productId}`}
                      </p>
                      {item.product && (
                        <p className="text-xs text-gray-500">৳{item.product.price}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-medium">{formatNumber(item.views)} ভিউ</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              সাম্প্রতিক ত্রুটিসমূহ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentErrors.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  কোনো সাম্প্রতিক ত্রুটি নেই
                </p>
              ) : (
                data.recentErrors.slice(0, 5).map((error, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <p className="text-sm font-medium text-red-700">
                      {error.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleString('bn-BD')}
                    </p>
                    {error.url && (
                      <p className="text-xs text-gray-400 truncate">
                        {error.url}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}