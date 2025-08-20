"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Filter,
  Star,
  MapPin,
  DollarSign,
  Package,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Award,
  Tag,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  rating: number;
  location: string;
  availability: string[];
  sortBy: string;
  freeShipping: boolean;
  isOrganic: boolean;
  discount: boolean;
  brands: string[];
  dateRange: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearAll: () => void;
  isLoading?: boolean;
  productCount?: number;
  isMobile?: boolean;
}

const defaultFilters: FilterState = {
  priceRange: [0, 10000],
  categories: [],
  rating: 0,
  location: "",
  availability: [],
  sortBy: "newest",
  freeShipping: false,
  isOrganic: false,
  discount: false,
  brands: [],
  dateRange: "all",
};

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onClearAll,
  isLoading = false,
  productCount = 0,
  isMobile = false,
}: AdvancedFiltersProps) {
  const t = useTranslations("filters");
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    categories: true,
    rating: true,
    features: true,
    brands: false,
    availability: false,
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const removeFilter = (key: keyof FilterState, value?: any) => {
    if (key === 'categories' || key === 'availability' || key === 'brands') {
      const currentArray = filters[key] as string[];
      updateFilter(key, currentArray.filter(item => item !== value));
    } else if (key === 'priceRange') {
      updateFilter(key, defaultFilters.priceRange);
    } else if (key === 'rating') {
      updateFilter(key, 0);
    } else {
      updateFilter(key, (defaultFilters as any)[key]);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > defaultFilters.priceRange[0] || 
        filters.priceRange[1] < defaultFilters.priceRange[1]) count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.rating > 0) count++;
    if (filters.location) count++;
    if (filters.availability.length > 0) count += filters.availability.length;
    if (filters.freeShipping) count++;
    if (filters.isOrganic) count++;
    if (filters.discount) count++;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const categories = [
    { id: "fruits", label: "ফল", icon: "🍎" },
    { id: "vegetables", label: "সবজি", icon: "🥕" },
    { id: "dairy", label: "দুগ্ধজাত", icon: "🥛" },
    { id: "meat", label: "মাংস", icon: "🥩" },
    { id: "fish", label: "মাছ", icon: "🐟" },
    { id: "grains", label: "শস্য", icon: "🌾" },
    { id: "spices", label: "মসলা", icon: "🌶️" },
    { id: "organic", label: "জৈব", icon: "🌱" },
  ];

  const brands = [
    "Pran", "ACI", "BRAC", "Fresh", "Agora", "Meena Bazaar", "Shwapno", "বাংলাদেশী ব্র্যান্ড"
  ];

  const sortOptions = [
    { value: "newest", label: "নতুন প্রথম" },
    { value: "oldest", label: "পুরাতন প্রথম" },
    { value: "price-low", label: "কম দাম প্রথম" },
    { value: "price-high", label: "বেশি দাম প্রথম" },
    { value: "rating", label: "রেটিং অনুসারে" },
    { value: "popular", label: "জনপ্রিয়তা" },
    { value: "discount", label: "ছাড় অনুসারে" },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Quick Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            দ্রুত ফিল্টার
          </h3>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-3 w-3 mr-1" />
              সব পরিষ্কার ({activeFiltersCount})
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.freeShipping ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('freeShipping', !filters.freeShipping)}
            className="text-xs"
          >
            <Truck className="h-3 w-3 mr-1" />
            ফ্রি শিপিং
          </Button>
          <Button
            variant={filters.isOrganic ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('isOrganic', !filters.isOrganic)}
            className="text-xs"
          >
            <Award className="h-3 w-3 mr-1" />
            জৈব পণ্য
          </Button>
          <Button
            variant={filters.discount ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('discount', !filters.discount)}
            className="text-xs"
          >
            <Tag className="h-3 w-3 mr-1" />
            ছাড়যুক্ত
          </Button>
        </div>
      </div>

      <Separator />

      {/* Sort By */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          সাজান
        </Label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            দাম সীমা
          </Label>
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value)}
              max={10000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>৳{filters.priceRange[0]}</span>
              <span>৳{filters.priceRange[1]}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="সর্বনিম্ন"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
              className="text-xs h-8"
            />
            <Input
              type="number"
              placeholder="সর্বোচ্চ"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
              className="text-xs h-8"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Categories */}
      <Collapsible open={expandedSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            ক্যাটাগরি
          </Label>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div className="grid grid-cols-1 gap-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-3">
                <Checkbox
                  id={category.id}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('categories', [...filters.categories, category.id]);
                    } else {
                      updateFilter('categories', filters.categories.filter(c => c !== category.id));
                    }
                  }}
                />
                <Label
                  htmlFor={category.id}
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <span className="text-lg">{category.icon}</span>
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Rating */}
      <Collapsible open={expandedSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-600" />
            রেটিং
          </Label>
          {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <RadioGroup
            value={filters.rating.toString()}
            onValueChange={(value) => updateFilter('rating', Number(value))}
          >
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label
                  htmlFor={`rating-${rating}`}
                  className="flex items-center gap-1 cursor-pointer text-sm"
                >
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-gray-300" />
                  ))}
                  <span className="ml-1">ও তার উপরে</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Brands */}
      <Collapsible open={expandedSections.brands} onOpenChange={() => toggleSection('brands')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-600" />
            ব্র্যান্ড
          </Label>
          {expandedSections.brands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-3">
                <Checkbox
                  id={brand}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('brands', [...filters.brands, brand]);
                    } else {
                      updateFilter('brands', filters.brands.filter(b => b !== brand));
                    }
                  }}
                />
                <Label htmlFor={brand} className="text-sm font-normal cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Date Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          যোগ করার সময়
        </Label>
        <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব সময়</SelectItem>
            <SelectItem value="today">আজ</SelectItem>
            <SelectItem value="week">এই সপ্তাহ</SelectItem>
            <SelectItem value="month">এই মাস</SelectItem>
            <SelectItem value="3months">গত ৩ মাস</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {productCount > 0 && (
        <div className="text-center py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            {productCount} টি পণ্য পাওয়া গেছে
          </p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            ফিল্টার
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              পণ্য ফিল্টার
            </SheetTitle>
            <SheetDescription>
              আপনার পছন্দ অনুযায়ী পণ্য খুঁজে নিন
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Filter className="h-5 w-5 text-green-600" />
          ফিল্টার
        </h2>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} টি সক্রিয়
          </Badge>
        )}
      </div>

      <FilterContent />
    </div>
  );
}

// Active Filters Display Component
export function ActiveFilters({ 
  filters, 
  onRemoveFilter, 
  onClearAll 
}: {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: any) => void;
  onClearAll: () => void;
}) {
  const activeFilters = [];

  // Price range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
    activeFilters.push({
      key: 'priceRange',
      label: `৳${filters.priceRange[0]} - ৳${filters.priceRange[1]}`,
      value: null
    });
  }

  // Categories
  filters.categories.forEach(category => {
    const categoryObj = {
      id: "fruits", label: "ফল", icon: "🍎"
    };
    activeFilters.push({
      key: 'categories',
      label: categoryObj.label,
      value: category
    });
  });

  // Rating
  if (filters.rating > 0) {
    activeFilters.push({
      key: 'rating',
      label: `${filters.rating}+ রেটিং`,
      value: null
    });
  }

  // Features
  if (filters.freeShipping) {
    activeFilters.push({
      key: 'freeShipping',
      label: 'ফ্রি শিপিং',
      value: null
    });
  }

  if (filters.isOrganic) {
    activeFilters.push({
      key: 'isOrganic',
      label: 'জৈব পণ্য',
      value: null
    });
  }

  if (filters.discount) {
    activeFilters.push({
      key: 'discount',
      label: 'ছাড়যুক্ত',
      value: null
    });
  }

  // Brands
  filters.brands.forEach(brand => {
    activeFilters.push({
      key: 'brands',
      label: brand,
      value: brand
    });
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          সক্রিয় ফিল্টার ({activeFilters.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
        >
          সব পরিষ্কার
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <Badge
            key={`${filter.key}-${index}`}
            variant="secondary"
            className="flex items-center gap-1 pr-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-xs">{filter.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-gray-300 dark:hover:bg-gray-600 ml-1"
              onClick={() => onRemoveFilter(filter.key as keyof FilterState, filter.value)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}