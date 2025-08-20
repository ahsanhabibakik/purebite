"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Eye,
  Heart,
  ShoppingCart,
  Star,
  Share2,
  ZoomIn,
  Package,
  Truck,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useComparisonStore } from "@/store/comparison";
import { ProductGridSkeleton, ProductCardSkeleton } from "@/components/LoadingStates";

interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category: string;
  brand?: string;
  inStock: boolean;
  isOrganic?: boolean;
  freeShipping?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
  tags?: string[];
  createdAt: string;
}

interface EnhancedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  viewMode?: "grid" | "list";
  enableViewToggle?: boolean;
  enableSorting?: boolean;
  enableQuickActions?: boolean;
  onProductClick?: (product: Product) => void;
  onViewModeChange?: (mode: "grid" | "list") => void;
  className?: string;
}

export function EnhancedProductGrid({
  products,
  isLoading = false,
  viewMode = "grid",
  enableViewToggle = true,
  enableSorting = true,
  enableQuickActions = true,
  onProductClick,
  onViewModeChange,
  className = "",
}: EnhancedProductGridProps) {
  const t = useTranslations("products");
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [sortBy, setSortBy] = useState("newest");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToComparison } = useComparisonStore();

  const sortOptions = [
    { value: "newest", label: "নতুন প্রথম", icon: Clock },
    { value: "oldest", label: "পুরাতন প্রথম", icon: Clock },
    { value: "price-low", label: "কম দাম", icon: SortAsc },
    { value: "price-high", label: "বেশি দাম", icon: SortDesc },
    { value: "rating", label: "রেটিং", icon: Star },
    { value: "popular", label: "জনপ্রিয়", icon: TrendingUp },
    { value: "name", label: "নাম", icon: SortAsc },
  ];

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "popular":
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setCurrentViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleAddToComparison = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToComparison({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    });
  };

  if (isLoading) {
    return currentViewMode === "grid" ? (
      <ProductGridSkeleton count={8} />
    ) : (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const isWishlisted = isInWishlist(product.id);
    const discountPercentage = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discount;

    return (
      <Card 
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-100 dark:hover:shadow-green-900/20 cursor-pointer border-0 shadow-sm hover:scale-105"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
        onClick={() => onProductClick?.(product)}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                নতুন
              </Badge>
            )}
            {product.isTrending && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                জনপ্রিয়
              </Badge>
            )}
            {discountPercentage && discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isOrganic && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                <Award className="h-3 w-3" />
                জৈব
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-red-500 text-white px-4 py-2">
                স্টক নেই
              </Badge>
            </div>
          )}

          {/* Quick Actions */}
          {enableQuickActions && (
            <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
              hoveredProduct === product.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isWishlisted ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় যোগ করুন'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                      onClick={(e) => handleAddToComparison(e, product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>তুলনায় যোগ করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>শেয়ার করুন</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Zoom Overlay */}
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
            hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
          }`}>
            <ZoomIn className="h-8 w-8 text-white" />
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="text-gray-500">
              {product.category}
            </Badge>
            {product.brand && (
              <span className="text-gray-500 font-medium">{product.brand}</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">
                ৳{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-2 text-xs">
            {product.freeShipping && (
              <div className="flex items-center gap-1 text-green-600">
                <Truck className="h-3 w-3" />
                <span>ফ্রি ডেলিভারি</span>
              </div>
            )}
            {product.inStock && (
              <div className="flex items-center gap-1 text-blue-600">
                <Package className="h-3 w-3" />
                <span>স্টকে আছে</span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 transform hover:scale-105"
            onClick={(e) => handleAddToCart(e, product)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const isWishlisted = isInWishlist(product.id);
    const discountPercentage = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discount;

    return (
      <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => onProductClick?.(product)}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {discountPercentage && discountPercentage > 0 && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    {product.isOrganic && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        জৈব
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        নতুন
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Quick Actions */}
                {enableQuickActions && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleAddToComparison(e, product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} ({product.reviewCount} রিভিউ)
                </span>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-600">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {product.freeShipping && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Truck className="h-4 w-4" />
                      <span>ফ্রি ডেলিভারি</span>
                    </div>
                  )}
                  <Button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!product.inStock}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sortedProducts.length} টি পণ্য পাওয়া গেছে
          </span>
          
          {enableSorting && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">সাজান:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* View Toggle */}
        {enableViewToggle && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={currentViewMode === "grid" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("grid")}
              className="h-7 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={currentViewMode === "list" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("list")}
              className="h-7 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            কোনো পণ্য পাওয়া যায়নি
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            অনুগ্রহ করে ভিন্ন ফিল্টার বা সার্চ ব্যবহার করে দেখুন
          </p>
        </div>
      ) : currentViewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProducts.map(product => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}