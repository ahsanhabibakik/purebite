"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus,
  Scale,
  Eye,
  Share2
} from "lucide-react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useComparisonStore } from "@/store/comparison";
import { cn } from "@/lib/utils";

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem, openCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToComparison, removeItem: removeFromComparison, isInComparison, getTotalItems } = useComparisonStore();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
    onClose();
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleComparisonToggle = () => {
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
    } else if (getTotalItems() < 3) {
      addToComparison(product);
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Product Quick View</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={product.images[selectedImageIndex] || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {discountPercentage > 0 && (
                <Badge className="absolute left-4 top-4 bg-red-500 text-white">
                  -{discountPercentage}% ছাড়
                </Badge>
              )}
              {product.featured && (
                <Badge className="absolute right-4 top-4 bg-yellow-500 text-white">
                  ⭐ ফিচার্ড
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square w-16 overflow-hidden rounded border-2 ${
                      selectedImageIndex === index ? "border-green-600" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ৳{product.originalPrice}
                </span>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive">
                  {discountPercentage}% সাশ্রয়
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(৪.৮ - ২৪টি রিভিউ)</span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`font-medium ${product.inStock ? "text-green-700" : "text-red-700"}`}>
                {product.inStock ? `স্টকে আছে (${product.stockQuantity} ${product.unit})` : "স্টকে নেই"}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="flex items-center gap-4">
                <span className="font-medium">পরিমাণ:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-1 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">{product.unit}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.inStock ? `৳${product.price * quantity} - কার্টে যোগ করুন` : "স্টকে নেই"}
              </Button>
              
              <Button
                variant="outline"
                asChild
                className="w-full"
                size="lg"
              >
                <Link href={`/products/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  বিস্তারিত দেখুন
                </Link>
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={cn(
                  "flex-1",
                  isInWishlist(product.id) ? "bg-red-50 text-red-600 border-red-200" : ""
                )}
              >
                <Heart className={cn("mr-2 h-4 w-4", isInWishlist(product.id) ? "fill-current" : "")} />
                {isInWishlist(product.id) ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleComparisonToggle}
                disabled={!isInComparison(product.id) && getTotalItems() >= 3}
                className={cn(
                  "flex-1",
                  isInComparison(product.id) ? "bg-blue-50 text-blue-600 border-blue-200" : ""
                )}
              >
                <Scale className={cn("mr-2 h-4 w-4", isInComparison(product.id) ? "fill-current" : "")} />
                {isInComparison(product.id) ? "তুলনা থেকে সরান" : "তুলনায় যোগ করুন"}
              </Button>
              
              <Button variant="outline" size="lg" className="aspect-square p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
              <div>
                <strong>ক্যাটাগরি:</strong> {product.subcategory}
              </div>
              <div>
                <strong>ওজন:</strong> {product.weight || 'N/A'}গ্রাম
              </div>
              <div>
                <strong>একক:</strong> {product.unit}
              </div>
              {product.origin && (
                <div>
                  <strong>উৎপাদনস্থল:</strong> {product.origin}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}