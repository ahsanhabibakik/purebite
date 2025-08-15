'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Product } from '@/types/product';

// Temporary type definition since we're having import issues
type RecommendationType = 'PERSONALIZED' | 'TRENDING' | 'NEW_ARRIVALS' | 'SIMILAR_PRODUCTS' | 'ALSO_VIEWED' | 'ALSO_BOUGHT' | 'PRICE_DROP';

interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
  type: RecommendationType;
  product: Product;
}

interface RecommendationSectionProps {
  title: string;
  type?: RecommendationType;
  productId?: string;
  limit?: number;
  excludeProductIds?: string[];
  className?: string;
  showRefresh?: boolean;
}

export function RecommendationSection({
  title,
  type,
  productId,
  limit = 8,
  excludeProductIds = [],
  className = '',
  showRefresh = false
}: RecommendationSectionProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const itemsPerPage = 4;

  useEffect(() => {
    fetchRecommendations();
  }, [type, productId, session]);

  const fetchRecommendations = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (productId) params.append('productId', productId);
      params.append('limit', limit.toString());
      if (excludeProductIds.length > 0) {
        params.append('excludeIds', excludeProductIds.join(','));
      }

      const response = await fetch(`/api/recommendations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProductClick = async (product: Product, recType: RecommendationType) => {
    if (session?.user) {
      try {
        await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'track_click',
            productId: product.id,
            type: recType,
            metadata: {
              section: title,
              position: recommendations.findIndex(r => r.productId === product.id)
            }
          })
        });
      } catch (error) {
        console.error('Error tracking recommendation click:', error);
      }
    }
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, recommendations.length - itemsPerPage);
    setCurrentIndex(prev => Math.min(prev + itemsPerPage, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - itemsPerPage, 0));
  };

  const canGoNext = currentIndex + itemsPerPage < recommendations.length;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            {showRefresh && <Skeleton className="h-10 w-10" />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          
          <div className="flex items-center gap-2">
            {showRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRecommendations(true)}
                disabled={refreshing}
                className="p-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {recommendations.length > itemsPerPage && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  disabled={!canGoPrev}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  disabled={!canGoNext}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out gap-6"
            style={{ 
              transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`,
              width: `${(recommendations.length * 100) / itemsPerPage}%`
            }}
          >
            {recommendations.map((rec, index) => (
              <div 
                key={rec.productId} 
                className="flex-shrink-0"
                style={{ width: `${100 / recommendations.length}%` }}
              >
                <div className="relative">
                  <ProductCard 
                    product={rec.product}
                    onClick={() => handleProductClick(rec.product, rec.type)}
                  />
                  
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    {rec.reason}
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      {(rec.score * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {recommendations.length > itemsPerPage && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ 
              length: Math.ceil(recommendations.length / itemsPerPage) 
            }).map((_, index) => {
              const pageIndex = index * itemsPerPage;
              const isActive = currentIndex === pageIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(pageIndex)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isActive ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  aria-label={`পেজ ${index + 1} এ যান`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function PersonalizedRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'>) {
  return (
    <RecommendationSection
      {...props}
      type="PERSONALIZED"
      title="আপনার জন্য বিশেষ সুপারিশ"
      showRefresh={true}
    />
  );
}

export function TrendingRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'>) {
  return (
    <RecommendationSection
      {...props}
      type="TRENDING"
      title="এই সপ্তাহের জনপ্রিয় পণ্য"
    />
  );
}

export function NewArrivalsRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'>) {
  return (
    <RecommendationSection
      {...props}
      type="NEW_ARRIVALS"
      title="নতুন এসেছে"
    />
  );
}

export function SimilarProductsRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'> & { productId: string }) {
  return (
    <RecommendationSection
      {...props}
      type="SIMILAR_PRODUCTS"
      title="অনুরূপ পণ্যসমূহ"
    />
  );
}

export function AlsoViewedRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'> & { productId: string }) {
  return (
    <RecommendationSection
      {...props}
      type="ALSO_VIEWED"
      title="অন্যরা যা দেখেছেন"
    />
  );
}

export function AlsoBoughtRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'> & { productId: string }) {
  return (
    <RecommendationSection
      {...props}
      type="ALSO_BOUGHT"
      title="অন্যরা যা কিনেছেন"
    />
  );
}

export function PriceDropRecommendations(props: Omit<RecommendationSectionProps, 'type' | 'title'>) {
  return (
    <RecommendationSection
      {...props}
      type="PRICE_DROP"
      title="দামে ছাড়ের পণ্যসমূহ"
    />
  );
}