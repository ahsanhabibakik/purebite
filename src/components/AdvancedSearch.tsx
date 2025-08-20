"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Star, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SearchSuggestion {
  id: string;
  type: 'product' | 'category' | 'brand';
  title: string;
  subtitle?: string;
  price?: number;
  image?: string;
  category?: string;
}

interface AdvancedSearchProps {
  onSearch?: (query: string, filters: any) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export function AdvancedSearch({ 
  onSearch, 
  placeholder = "পণ্য, ব্র্যান্ড বা ক্যাটেগরি খুঁজুন...",
  showFilters = true 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 2000] as [number, number],
    rating: 0,
    inStock: false,
    location: "",
    sortBy: "relevance"
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, filters);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.title, filters);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 2000],
      rating: 0,
      inStock: false,
      location: "",
      sortBy: "relevance"
    });
  };

  const hasActiveFilters = filters.category || filters.rating > 0 || filters.inStock || 
                          filters.location || filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 2000 || filters.sortBy !== "relevance";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-12 pr-20 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            {showFilters && (
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                ফিল্টার
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            )}
            <Button onClick={handleSearch} className="px-6">
              খুঁজুন
            </Button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <span className="mt-2 block">খুঁজছি...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    {suggestion.image && (
                      <img 
                        src={suggestion.image} 
                        alt={suggestion.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{suggestion.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type === 'product' ? 'পণ্য' : 
                           suggestion.type === 'category' ? 'ক্যাটেগরি' : 'ব্র্যান্ড'}
                        </Badge>
                      </div>
                      {suggestion.subtitle && (
                        <p className="text-sm text-gray-600">{suggestion.subtitle}</p>
                      )}
                      {suggestion.price && (
                        <p className="text-sm font-medium text-green-600">৳{suggestion.price}</p>
                      )}
                    </div>
                    <Search className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                কোন ফলাফল পাওয়া যায়নি
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">উন্নত ফিল্টার</h3>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  সব পরিষ্কার করুন
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAdvancedFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ক্যাটেগরি
              </label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">সব ক্যাটেগরি</option>
                <option value="ফল">ফল</option>
                <option value="সবজি">সবজি</option>
                <option value="দুগ্ধজাত">দুগ্ধজাত</option>
                <option value="মাছ">মাছ</option>
                <option value="মাংস">মাংস</option>
                <option value="চাল-ডাল">চাল-ডাল</option>
                <option value="মসলা">মসলা</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                দামের সীমা
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="কম"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters({
                    ...filters, 
                    priceRange: [Number(e.target.value) || 0, filters.priceRange[1]]
                  })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="বেশি"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    ...filters, 
                    priceRange: [filters.priceRange[0], Number(e.target.value) || 2000]
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                রেটিং
              </label>
              <select 
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={0}>যেকোনো রেটিং</option>
                <option value={4}>৪+ স্টার</option>
                <option value={3}>৩+ স্টার</option>
                <option value={2}>২+ স্টার</option>
                <option value={1}>১+ স্টার</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                সাজানো
              </label>
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="relevance">প্রাসঙ্গিকতা</option>
                <option value="price_low">দাম: কম থেকে বেশি</option>
                <option value="price_high">দাম: বেশি থেকে কম</option>
                <option value="rating">রেটিং</option>
                <option value="newest">নতুন</option>
                <option value="popular">জনপ্রিয়</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm text-gray-700">শুধু স্টকে আছে</span>
            </label>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="এলাকা/জিলা"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-40"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSearch} className="px-8">
              ফিল্টার প্রয়োগ করুন
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.category}
              <button onClick={() => setFilters({...filters, category: ""})}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.rating}+ স্টার
              <button onClick={() => setFilters({...filters, rating: 0})}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="flex items-center gap-1">
              স্টকে আছে
              <button onClick={() => setFilters({...filters, inStock: false})}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.location}
              <button onClick={() => setFilters({...filters, location: ""})}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}