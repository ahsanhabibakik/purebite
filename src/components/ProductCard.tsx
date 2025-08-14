"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Scale, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useComparisonStore } from "@/store/comparison";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToComparison, removeItem: removeFromComparison, isInComparison, getTotalItems } = useComparisonStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    openCart();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
    } else if (getTotalItems() < 3) {
      addToComparison(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute right-2 top-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
              ⭐ ফিচার্ড
            </div>
          )}
          
          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="rounded bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                স্টক নেই
              </span>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="absolute right-2 top-12 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {onQuickView && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 rounded-full p-0"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "h-8 w-8 rounded-full p-0",
                isInWishlist(product.id) ? "bg-red-100 text-red-600 hover:bg-red-200" : ""
              )}
              onClick={handleWishlistToggle}
            >
              <Heart className={cn("h-4 w-4", isInWishlist(product.id) ? "fill-current" : "")} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "h-8 w-8 rounded-full p-0",
                isInComparison(product.id) ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : ""
              )}
              onClick={handleComparisonToggle}
              disabled={!isInComparison(product.id) && getTotalItems() >= 3}
            >
              <Scale className={cn("h-4 w-4", isInComparison(product.id) ? "fill-current" : "")} />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>
          
          {/* Category & Unit */}
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-1">{product.subcategory}</span>
            <span>•</span>
            <span>{product.unit}</span>
          </div>
          
          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Price */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
          
          {/* Rating & Reviews (placeholder) */}
          <div className="mb-3 flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(২৪ রিভিউ)</span>
          </div>
          
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.inStock ? "কার্টে যোগ করুন" : "স্টক নেই"}
          </Button>
        </div>
      </Link>
    </div>
  );
}