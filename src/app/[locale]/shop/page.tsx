"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Grid, List, Search, X, SlidersHorizontal, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from 'next-intl';

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
  stockCount?: number;
  featured?: boolean;
}

function ShopPageContent() {
  const t = useTranslations('shop');
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: '50', // Fetch more products for shop page
          sortBy,
          sortOrder,
          ...(selectedCategory !== 'all' && { category: selectedCategory }),
          ...(searchTerm && { search: searchTerm }),
          ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
          ...(priceRange[1] < 2000 && { maxPrice: priceRange[1].toString() }),
        });

        const response = await fetch(`/api/products?${params}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(data.products.map((p: Product) => p.category))];
          setCategories(uniqueCategories);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy, sortOrder, searchTerm, priceRange]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (inStockOnly && !product.inStock) return false;
      if (featuredOnly && !product.featured) return false;
      return true;
    });
  }, [products, inStockOnly, featuredOnly]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">আমাদের পণ্য</h1>
          <p className="text-gray-600">
            {loading ? 'পণ্য লোড হচ্ছে...' : `${filteredProducts.length} টি পণ্য পাওয়া গেছে`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            ফিল্টার
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">ফিল্টার</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              সব ফিল্টার মুছুন
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">ক্যাটেগরি</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div>
              <Label className="text-sm font-medium mb-2 block">সাজান</Label>
              <Select 
                value={`${sortBy}-${sortOrder}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">নতুন প্রথমে</SelectItem>
                  <SelectItem value="createdAt-asc">পুরাতন প্রথমে</SelectItem>
                  <SelectItem value="price-asc">দাম কম থেকে বেশি</SelectItem>
                  <SelectItem value="price-desc">দাম বেশি থেকে কম</SelectItem>
                  <SelectItem value="name-asc">নাম (A-Z)</SelectItem>
                  <SelectItem value="name-desc">নাম (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">দামের পরিসীমা</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="কম"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-20"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="বেশি"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-20"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="inStock" className="text-sm">শুধু স্টকে আছে</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="featured" className="text-sm">ফিচার্ড পণ্য</Label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">পণ্য লোড হচ্ছে...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
          <p className="text-gray-600 mb-4">আপনার অনুসন্ধান মানদণ্ড পরিবর্তন করে আবার চেষ্টা করুন</p>
          <Button onClick={clearFilters}>সব ফিল্টার মুছুন</Button>
        </div>
      ) : (
        <div 
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading shop...</span>
        </div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}