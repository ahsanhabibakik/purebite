"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image?: string;
  images?: string[];
  category: string;
  tags?: string[];
  inStock: boolean;
  averageRating?: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
      } else {
        console.error('Search failed:', response.statusText);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchProducts(debouncedQuery);
  }, [debouncedQuery, searchProducts]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery("");
      setResults([]);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2 bg-white rounded-lg shadow-xl">
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>কিছু টাইপ করে সার্চ শুরু করুন</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
              <p>খুঁজে দেখা হচ্ছে...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>কোন পণ্য পাওয়া যায়নি</p>
              <p className="text-sm mt-2">অন্য কিছু খুঁজে দেখুন</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-3 text-sm text-gray-600">
                {results.length} টি পণ্য পাওয়া গেছে
              </div>
              <div className="space-y-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/bn/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={product.image || product.images?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.salePrice ? (
                          <>
                            <span className="text-sm font-semibold text-green-600">
                              ৳{product.salePrice}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ৳{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-green-600">
                            ৳{product.price}
                          </span>
                        )}
                        {product.category && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {product.category}
                            </span>
                          </>
                        )}
                        {product.averageRating && product.averageRating > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-yellow-500">
                              ⭐ {product.averageRating.toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {results.length === 8 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href={`/bn/shop?search=${encodeURIComponent(query)}`} onClick={onClose}>
                      আরও ফলাফল দেখুন
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}