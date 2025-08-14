"use client";

import { useState, useMemo } from "react";
import { Grid, List, Search, X, SlidersHorizontal, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ProductCard";
import { ProductQuickView } from "@/components/ProductQuickView";
import { products } from "@/data/products";
import { ProductCategory, Product } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels = {
  [ProductCategory.HOMEMADE_SNACKS]: "হোমমেড স্ন্যাকস",
  [ProductCategory.DRY_FOODS]: "শুকনো খাবার",
  [ProductCategory.FRESH_PRODUCTS]: "তাজা পণ্য",
  [ProductCategory.BEVERAGES]: "পানীয়",
  [ProductCategory.GIFT_COMBOS]: "গিফট কম্বো",
  [ProductCategory.SEASONAL]: "মৌসুমী"
};

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "price_low" | "price_high" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by stock status
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Filter by featured status
    if (featuredOnly) {
      filtered = filtered.filter(product => product.featured);
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [selectedCategory, sortBy, searchTerm, priceRange, inStockOnly, featuredOnly]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    setFeaturedOnly(false);
  };

  const hasActiveFilters = selectedCategory !== "all" || searchTerm || inStockOnly || featuredOnly || priceRange[0] > 0 || priceRange[1] < 2000;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">আমাদের পণ্যসমূহ</h1>
        <p className="text-gray-600">
          স্বাস্থ্যকর ও পুষ্টিকর খাবারের বিশাল সংগ্রহ ({filteredAndSortedProducts.length}টি পণ্য)
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="পণ্যের নাম, বর্ণনা বা ট্যাগ দিয়ে খুঁজুন..."
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

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            ফিল্টার
            {hasActiveFilters && (
              <span className="bg-green-600 text-white rounded-full h-2 w-2"></span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              ফিল্টার পরিষ্কার করুন
            </Button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="text-sm whitespace-nowrap">সাজানো:</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "price_low" | "price_high" | "newest")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">নতুন আগে</SelectItem>
                <SelectItem value="name">নাম অনুযায়ী</SelectItem>
                <SelectItem value="price_low">দাম কম থেকে বেশি</SelectItem>
                <SelectItem value="price_high">দাম বেশি থেকে কম</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none border-r"
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

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">ক্যাটাগরি</Label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">দামের সীমা</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="মিন"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                    className="text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="ম্যাক্স"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 2000])}
                    className="text-sm"
                  />
                </div>
                <div className="text-xs text-gray-500">৳{priceRange[0]} - ৳{priceRange[1]}</div>
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">স্টক স্ট্যাটাস</Label>
              <Button
                variant={inStockOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setInStockOnly(!inStockOnly)}
                className="w-full justify-start"
              >
                {inStockOnly && <CheckCircle className="h-4 w-4 mr-2" />}
                শুধু স্টকে আছে
              </Button>
            </div>

            {/* Featured Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">ফিচার্ড</Label>
              <Button
                variant={featuredOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className="w-full justify-start"
              >
                {featuredOnly && <CheckCircle className="h-4 w-4 mr-2" />}
                শুধু ফিচার্ড পণ্য
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                {categoryLabels[selectedCategory]}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {searchTerm && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                খোঁজা: &quot;{searchTerm}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {inStockOnly && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                স্টকে আছে
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInStockOnly(false)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {featuredOnly && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                ফিচার্ড
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFeaturedOnly(false)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
          <p className="text-gray-500 mb-4">
            আপনার ফিল্টার অনুযায়ী কোন পণ্য পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
          </p>
          <Button onClick={clearFilters}>সব ফিল্টার পরিষ্কার করুন</Button>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              className={viewMode === "list" ? "flex flex-row" : ""}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}