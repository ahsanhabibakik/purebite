"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { Product } from "@/types/product";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      product.subcategory?.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filteredProducts.slice(0, 8));
  }, [query]);

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
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={product.images[0] || "/placeholder-product.jpg"}
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
                        <span className="text-sm font-semibold text-green-600">
                          ৳{product.price}
                        </span>
                        {product.subcategory && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {product.subcategory}
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
                  <Button variant="outline" asChild onClick={onClose}>
                    <Link href={`/shop?search=${encodeURIComponent(query)}`}>
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