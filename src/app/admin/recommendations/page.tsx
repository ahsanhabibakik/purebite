'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Calculator, TrendingUp, Users, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationStats {
  totalRecommendations: number;
  activeUsers: number;
  clickThroughRate: number;
  conversionRate: number;
  topRecommendationType: string;
  lastCalculated: string;
}

export default function AdminRecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.email) {
      router.push('/auth/login');
      return;
    }
    fetchStats();
  }, [session, status]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/recommendations/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching recommendation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSimilarities = async (type: string = 'all') => {
    setCalculating(true);
    try {
      const response = await fetch('/api/recommendations/calculate-similarities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`সফলভাবে ${data.calculatedCount}টি সিমিলারিটি ক্যালকুলেট করা হয়েছে`);
        fetchStats(); // Refresh stats
      } else {
        const error = await response.json();
        alert(`ত্রুটি: ${error.error}`);
      }
    } catch (error) {
      console.error('Error calculating similarities:', error);
      alert('সিমিলারিটি ক্যালকুলেট করতে সমস্যা হয়েছে');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">রেকমেন্ডেশন ড্যাশবোর্ড</h1>
            <p className="text-gray-600">পণ্য সুপারিশ সিস্টেমের বিশ্লেষণ ও পরিচালনা</p>
          </div>
          <Button
            onClick={() => fetchStats()}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট রেকমেন্ডেশন</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRecommendations || 0}</div>
            <p className="text-xs text-muted-foreground">
              সক্রিয় সুপারিশ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় ব্যবহারকারী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              গত ৭ দিনে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ক্লিক রেট</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clickThroughRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              সুপারিশে ক্লিক হার
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কনভার্শন রেট</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              ক্রয় রূপান্তর হার
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Similarity Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              সিমিলারিটি ক্যালকুলেশন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              পণ্যের মধ্যে সিমিলারিটি ক্যালকুলেট করুন বেহতর সুপারিশের জন্য
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => calculateSimilarities('content_based')}
                disabled={calculating}
                variant="outline"
                className="w-full"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Package className="w-4 h-4 mr-2" />
                )}
                Content-Based
              </Button>
              
              <Button
                onClick={() => calculateSimilarities('collaborative')}
                disabled={calculating}
                variant="outline"
                className="w-full"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Collaborative
              </Button>
              
              <Button
                onClick={() => calculateSimilarities('category')}
                disabled={calculating}
                variant="outline"
                className="w-full"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Package className="w-4 h-4 mr-2" />
                )}
                Category-Based
              </Button>
              
              <Button
                onClick={() => calculateSimilarities('all')}
                disabled={calculating}
                className="w-full"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4 mr-2" />
                )}
                সব ক্যালকুলেট করুন
              </Button>
            </div>

            {stats?.lastCalculated && (
              <p className="text-xs text-gray-500">
                শেষ ক্যালকুলেশন: {new Date(stats.lastCalculated).toLocaleString('bn-BD')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              সিস্টেম স্ট্যাটাস
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">জনপ্রিয় রেকমেন্ডেশন টাইপ:</span>
                <span className="text-sm font-medium">{stats?.topRecommendationType || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ডেটাবেস স্ট্যাটাস:</span>
                <span className="text-sm font-medium text-green-600">সংযুক্ত</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API স্ট্যাটাস:</span>
                <span className="text-sm font-medium text-green-600">চালু</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">সিস্টেম তথ্য</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• রেকমেন্ডেশন এনজিন সক্রিয়</li>
                <li>• ব্যবহারকারীর আচরণ ট্র্যাকিং চালু</li>
                <li>• স্বয়ংক্রিয় সিমিলারিটি আপডেট</li>
                <li>• পারফরমেন্স মনিটরিং সক্রিয়</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>সহায়তা ও গাইডলাইন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">রেকমেন্ডেশন টাইপসমূহ:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>PERSONALIZED:</strong> ব্যক্তিগত পছন্দ ভিত্তিক</li>
                <li><strong>ALSO_VIEWED:</strong> অন্যরা যা দেখেছেন</li>
                <li><strong>ALSO_BOUGHT:</strong> অন্যরা যা কিনেছেন</li>
                <li><strong>SIMILAR_PRODUCTS:</strong> অনুরূপ পণ্য</li>
                <li><strong>TRENDING:</strong> জনপ্রিয় পণ্য</li>
                <li><strong>NEW_ARRIVALS:</strong> নতুন পণ্য</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">সিমিলারিটি মেথডসমূহ:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Content-Based:</strong> পণ্যের বৈশিষ্ট্য ভিত্তিক</li>
                <li><strong>Collaborative:</strong> ব্যবহারকারীর আচরণ ভিত্তিক</li>
                <li><strong>Category:</strong> ক্যাটাগরি ভিত্তিক</li>
                <li><strong>Hybrid:</strong> সমন্বিত পদ্ধতি</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}