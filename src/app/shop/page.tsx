"use client";

import { useState, useMemo } from "react";
import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { ProductCategory } from "@/types/product";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "price_low" | "price_high" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
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
  }, [selectedCategory, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">আমাদের পণ্যসমূহ</h1>
        <p className="text-gray-600">
          স্বাস্থ্যকর ও পুষ্টিকর খাবারের বিশাল সংগ্রহ
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            সব পণ্য
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "price_low" | "price_high" | "newest")}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="newest">নতুন আগে</option>
            <option value="name">নাম অনুযায়ী</option>
            <option value="price_low">দাম কম থেকে বেশি</option>
            <option value="price_high">দাম বেশি থেকে কম</option>
          </select>

          {/* View Mode */}
          <div className="flex border rounded-md">
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
              className="rounded-l-none border-l"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            ফিল্টার
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">ফিল্টার অপশন</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">দামের পরিসর</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="সর্বনিম্ন"
                  className="border rounded-md px-3 py-1 text-sm flex-1"
                />
                <input
                  type="number"
                  placeholder="সর্বোচ্চ"
                  className="border rounded-md px-3 py-1 text-sm flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">স্টক স্ট্যাটাস</label>
              <select className="border rounded-md px-3 py-1 text-sm w-full">
                <option value="all">সব</option>
                <option value="in_stock">স্টকে আছে</option>
                <option value="out_of_stock">স্টকে নেই</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">বিশেষ অফার</label>
              <div className="flex gap-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  ছাড়যুক্ত
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  ফিচার্ড
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filteredAndSortedProducts.length} টি পণ্য পাওয়া গেছে
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                className="flex flex-row p-4"
              />
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            কোন পণ্য পাওয়া যায়নি
          </h3>
          <p className="text-gray-600 mb-4">
            অন্য ক্যাটাগরি বা ফিল্টার চেষ্টা করুন
          </p>
          <Button onClick={() => {
            setSelectedCategory("all");
            setSortBy("newest");
          }}>
            সব পণ্য দেখুন
          </Button>
        </div>
      )}

      {/* Load More (for pagination in future) */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" disabled>
            আরও পণ্য লোড করুন
          </Button>
        </div>
      )}
    </div>
  );
}