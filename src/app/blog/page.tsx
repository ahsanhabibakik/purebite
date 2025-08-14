"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Filter,
  X,
  BookOpen,
  ArrowRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blog";
import { BlogCategory } from "@/types/blog";

const categoryLabels = {
  [BlogCategory.RECIPES]: "রেসিপি",
  [BlogCategory.HEALTH_TIPS]: "স্বাস্থ্য টিপস",
  [BlogCategory.NUTRITION]: "পুষ্টি",
  [BlogCategory.LIFESTYLE]: "জীবনযাত্রা",
  [BlogCategory.INGREDIENT_GUIDE]: "উপাদান গাইড",
  [BlogCategory.SEASONAL]: "মৌসুমী"
};

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = useMemo(() => {
    let filtered = blogPosts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [searchTerm, selectedCategory]);

  const featuredPosts = blogPosts.filter(post => post.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  const BlogCard = ({ post, featured = false }: { post: typeof blogPosts[0], featured?: boolean }) => (
    <article className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg ${
      featured ? "col-span-1 md:col-span-2 lg:col-span-2" : ""
    }`}>
      <Link href={`/blog/${post.slug}`}>
        <div className={`relative overflow-hidden ${featured ? "aspect-[2/1]" : "aspect-[4/3]"}`}>
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes={featured ? "800px" : "400px"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute left-4 top-4">
            <Badge className="bg-green-600 text-white">
              {categoryLabels[post.category]}
            </Badge>
          </div>

          {/* Featured Badge */}
          {post.featured && (
            <div className="absolute right-4 top-4">
              <Badge className="bg-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            </div>
          )}

          {/* Content overlay for featured posts */}
          {featured && (
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm md:text-base opacity-90 line-clamp-2 mb-3">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime} মিনিট
                </div>
              </div>
            </div>
          )}
        </div>

        {!featured && (
          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 line-clamp-3 mt-2">
                {post.excerpt}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="24px"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime} মিনিট
                </span>
              </div>
            </div>
          </div>
        )}
      </Link>
    </article>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          স্বাস্থ্য ও পুষ্টি ব্লগ
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          স্বাস্থ্যকর খাবার, রেসিপি, পুষ্টি টিপস এবং জীবনযাত্রার মান উন্নয়নের জন্য 
          বিশেষজ্ঞদের পরামর্শ ও গাইড
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ব্লগ পোস্ট খুঁজুন..."
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

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            ফিল্টার
            {hasActiveFilters && (
              <span className="bg-green-600 text-white rounded-full h-2 w-2"></span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg border p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700">ক্যাটাগরি:</span>
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                সব
              </Button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key as BlogCategory)}
                >
                  {label}
                </Button>
              ))}
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  ফিল্টার পরিষ্কার করুন
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchTerm && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
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
            {selectedCategory !== "all" && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
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
          </div>
        )}
      </div>

      {/* Featured Posts Section */}
      {!hasActiveFilters && featuredPosts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">ফিচার্ড পোস্ট</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredPosts.slice(0, 2).map((post) => (
              <BlogCard key={post.id} post={post} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {hasActiveFilters ? "খোঁজার ফলাফল" : "সব পোস্ট"} ({filteredPosts.length}টি)
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন পোস্ট পাওয়া যায়নি</h3>
            <p className="text-gray-500 mb-4">
              আপনার ফিল্টার অনুযায়ী কোন ব্লগ পোস্ট পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
            </p>
            <Button onClick={clearFilters}>সব ফিল্টার পরিষ্কার করুন</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      {!hasActiveFilters && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            আরও স্বাস্থ্য টিপস পেতে চান?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            আমাদের নিউজলেটার সাবস্ক্রাইব করুন এবং নিয়মিত স্বাস্থ্যকর রেসিপি, 
            পুষ্টি টিপস এবং জীবনযাত্রার গাইড পান।
          </p>
          <Button asChild size="lg">
            <Link href="/#newsletter">
              নিউজলেটার সাবস্ক্রাইব করুন
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}