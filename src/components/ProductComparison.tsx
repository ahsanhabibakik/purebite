"use client";

import { useState, useEffect } from "react";
import { X, Scale, Star, Check, ShoppingCart, Eye, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  inStock: boolean;
  stockCount?: number;
  averageRating?: number;
  reviewCount?: number;
  brand?: string;
  weight?: string;
  origin?: string;
  nutrients?: { [key: string]: string };
  certifications?: string[];
}

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export function ProductComparison({ 
  isOpen, 
  onClose, 
  products, 
  onRemoveProduct,
  onAddToCart 
}: ProductComparisonProps) {
  const [comparisonData, setComparisonData] = useState<any>({});

  useEffect(() => {
    if (products.length > 0) {
      analyzeProducts();
    }
  }, [products]);

  const analyzeProducts = () => {
    const analysis = {
      priceRange: {
        min: Math.min(...products.map(p => p.salePrice || p.price)),
        max: Math.max(...products.map(p => p.salePrice || p.price))
      },
      averageRating: products.reduce((sum, p) => sum + (p.averageRating || 0), 0) / products.length,
      categories: [...new Set(products.map(p => p.category))],
      brands: [...new Set(products.map(p => p.brand).filter(Boolean))],
      allTags: [...new Set(products.flatMap(p => p.tags))],
      bestValue: products.reduce((best, current) => 
        (!best || (current.salePrice || current.price) < (best.salePrice || best.price)) ? current : best
      ),
      topRated: products.reduce((best, current) => 
        (!best || (current.averageRating || 0) > (best.averageRating || 0)) ? current : best
      )
    };
    
    setComparisonData(analysis);
  };

  const getComparisonFeatures = () => {
    const features = new Set<string>();
    
    products.forEach(product => {
      if (product.brand) features.add('ব্র্যান্ড');
      if (product.weight) features.add('ওজন');
      if (product.origin) features.add('উৎপাদনস্থল');
      if (product.nutrients) Object.keys(product.nutrients).forEach(nutrient => features.add(nutrient));
      if (product.certifications) features.add('সার্টিফিকেশন');
      features.add('স্টক');
      features.add('রেটিং');
      features.add('দাম');
    });
    
    return Array.from(features);
  };

  const getFeatureValue = (product: Product, feature: string) => {
    switch (feature) {
      case 'ব্র্যান্ড':
        return product.brand || 'N/A';
      case 'ওজন':
        return product.weight || 'N/A';
      case 'উৎপাদনস্থল':
        return product.origin || 'N/A';
      case 'সার্টিফিকেশন':
        return product.certifications?.join(', ') || 'N/A';
      case 'স্টক':
        return product.inStock ? `${product.stockCount || 0} টি` : 'নেই';
      case 'রেটিং':
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
          </div>
        );
      case 'দাম':
        return (
          <div className="text-sm">
            {product.salePrice ? (
              <>
                <span className="font-bold text-green-600">৳{product.salePrice}</span>
                <span className="text-gray-500 line-through ml-1">৳{product.price}</span>
              </>
            ) : (
              <span className="font-bold">৳{product.price}</span>
            )}
          </div>
        );
      default:
        return product.nutrients?.[feature] || 'N/A';
    }
  };

  const getBestInCategory = (feature: string) => {
    switch (feature) {
      case 'দাম':
        return products.reduce((best, current) => 
          (current.salePrice || current.price) < (best.salePrice || best.price) ? current : best
        ).id;
      case 'রেটিং':
        return products.reduce((best, current) => 
          (current.averageRating || 0) > (best.averageRating || 0) ? current : best
        ).id;
      case 'স্টক':
        return products.reduce((best, current) => 
          (current.stockCount || 0) > (best.stockCount || 0) ? current : best
        ).id;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">পণ্য তুলনা</h2>
            <Badge variant="secondary">{products.length} টি পণ্য</Badge>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Analysis */}
        {comparisonData.priceRange && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">দামের পরিসীমা:</span>
                <span className="font-bold ml-1">
                  ৳{comparisonData.priceRange.min} - ৳{comparisonData.priceRange.max}
                </span>
              </div>
              <div>
                <span className="text-gray-600">গড় রেটিং:</span>
                <span className="font-bold ml-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {comparisonData.averageRating.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">সেরা দাম:</span>
                <span className="font-bold ml-1 text-green-600">
                  {comparisonData.bestValue?.name}
                </span>
              </div>
              <div>
                <span className="text-gray-600">সর্বোচ্চ রেটিং:</span>
                <span className="font-bold ml-1 text-blue-600">
                  {comparisonData.topRated?.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-700 w-48">
                  বৈশিষ্ট্য
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 text-center min-w-64">
                    <div className="space-y-3">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 mx-auto">
                        <Image
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Product Name */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {product.category}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveProduct(product.id)}
                          className="p-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="p-1"
                        >
                          <Link href={`/products/${product.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(product.id)}
                          disabled={!product.inStock}
                          className="p-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {getComparisonFeatures().map((feature, index) => (
                <tr key={feature} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 font-medium text-gray-700 border-r">
                    {feature}
                  </td>
                  {products.map((product) => {
                    const isB1est = getBestInCategory(feature) === product.id;
                    return (
                      <td key={product.id} className={`p-4 text-center border-r ${isB1est ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          {getFeatureValue(product, feature)}
                          {isB1est && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              সেরা
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3 justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              বন্ধ করুন
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const comparison = {
                  products: products.map(p => ({ id: p.id, name: p.name })),
                  analysis: comparisonData,
                  timestamp: new Date().toISOString()
                };
                navigator.clipboard.writeText(JSON.stringify(comparison, null, 2));
              }}
            >
              তুলনা কপি করুন
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                products.forEach(product => {
                  if (product.inStock) {
                    onAddToCart(product.id);
                  }
                });
              }}
              disabled={!products.some(p => p.inStock)}
            >
              সব কার্টে যোগ করুন
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const bestValue = comparisonData.bestValue;
                if (bestValue && bestValue.inStock) {
                  onAddToCart(bestValue.id);
                }
              }}
              disabled={!comparisonData.bestValue?.inStock}
            >
              সেরা দামে কিনুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comparison Button Component
export function ComparisonToggle({ 
  productId, 
  isInComparison, 
  onToggle 
}: { 
  productId: string; 
  isInComparison: boolean; 
  onToggle: (productId: string) => void; 
}) {
  return (
    <Button
      variant={isInComparison ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(productId)}
      className="flex items-center gap-1"
    >
      <Scale className="h-4 w-4" />
      {isInComparison ? (
        <>
          <Minus className="h-3 w-3" />
          তুলনা থেকে সরান
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" />
          তুলনায় যোগ করুন
        </>
      )}
    </Button>
  );
}