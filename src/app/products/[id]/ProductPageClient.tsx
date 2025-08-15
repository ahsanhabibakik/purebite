"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Share2, 
  Star, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Truck, 
  Shield, 
  Award,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import ReviewSection from "@/components/reviews/ReviewSection";
import { useCartStore } from "@/store/cart";
import { useReviewsStore } from "@/store/reviews";
import { useRecommendationTracking } from "@/hooks/useRecommendationTracking";
import { SimilarProductsRecommendations, AlsoViewedRecommendations, AlsoBoughtRecommendations } from "@/components/recommendations/RecommendationSection";
import { Product } from "@/types/product";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "nutrition" | "reviews">("details");

  const { addItem, openCart } = useCartStore();
  const { getReviewStats } = useReviewsStore();
  const { trackAddToCart, trackWishlistAdd, trackShare, usePageViewTracking, useScrollTracking } = useRecommendationTracking();

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
    trackAddToCart(product.id, { quantity, source: 'product_page' });
  };

  const handleWishlistAdd = () => {
    // Add wishlist functionality here
    trackWishlistAdd(product.id, { source: 'product_page' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('পণ্যের লিঙ্ক কপি করা হয়েছে!');
    }
    trackShare(product.id, { method: 'link', source: 'product_page' });
  };

  // Track page view and scroll behavior
  usePageViewTracking(product.id);
  useScrollTracking(product.id);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const reviewStats = getReviewStats(product.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-600">হোম</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-green-600">শপ</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </nav>

      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/shop">
          <ChevronLeft className="mr-2 h-4 w-4" />
          পেছনে যান
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
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
              <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                -{discountPercentage}% ছাড়
              </div>
            )}
            {product.featured && (
              <div className="absolute right-4 top-4 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
                ⭐ ফিচার্ড
              </div>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square w-20 overflow-hidden rounded border-2 ${
                    selectedImageIndex === index ? "border-green-600" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
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
              <span className="rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-800">
                {discountPercentage}% সাশ্রয়
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-gray-600">(৪.৮ - ২৪টি রিভিউ)</span>
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
              <span
                key={tag}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {tag}
              </span>
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

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.inStock ? `৳${product.price * quantity} - কার্টে যোগ করুন` : "স্টকে নেই"}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="aspect-square p-0"
              onClick={handleWishlistAdd}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="aspect-square p-0"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">ফ্রি ডেলিভারি</p>
                <p className="text-sm text-gray-600">ঢাকার ভিতরে ২৪ ঘন্টায়</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">গুণগত মানের নিশ্চয়তা</p>
                <p className="text-sm text-gray-600">১০০% খাঁটি ও স্বাস্থ্যকর</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">সন্তোষজনক সেবা</p>
                <p className="text-sm text-gray-600">৯৮% গ্রাহক সন্তুষ্ট</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab("details")}
              className={`pb-2 font-medium transition-colors ${
                activeTab === "details" 
                  ? "border-b-2 border-green-600 text-green-600" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              বিস্তারিত তথ্য
            </button>
            {product.nutritionInfo && (
              <button 
                onClick={() => setActiveTab("nutrition")}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === "nutrition" 
                    ? "border-b-2 border-green-600 text-green-600" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                পুষ্টিগুণ
              </button>
            )}
            <button 
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 font-medium transition-colors ${
                activeTab === "reviews" 
                  ? "border-b-2 border-green-600 text-green-600" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              রিভিউ ({reviewStats.totalReviews})
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {/* Tab Content */}
          {activeTab === "details" && (
            <div>
              <h3 className="font-semibold text-lg mb-3">পণ্যের বিবরণ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p><strong>ক্যাটাগরি:</strong> {product.subcategory}</p>
                  <p><strong>ওজন/পরিমাণ:</strong> {product.weight}গ্রাম</p>
                  <p><strong>একক:</strong> {product.unit}</p>
                  {product.origin && <p><strong>উৎপাদনস্থল:</strong> {product.origin}</p>}
                  {product.expiryDate && <p><strong>মেয়াদ:</strong> {product.expiryDate}</p>}
                </div>
                {product.ingredients && (
                  <div>
                    <p className="font-medium mb-2">উপাদান:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "nutrition" && product.nutritionInfo && (
            <div>
              <h3 className="font-semibold text-lg mb-3">পুষ্টিগুণ (প্রতি ১০০গ্রামে)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{product.nutritionInfo.calories}</p>
                  <p className="text-sm text-gray-600">ক্যালোরি</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{product.nutritionInfo.protein}গ</p>
                  <p className="text-sm text-gray-600">প্রোটিন</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{product.nutritionInfo.carbs}গ</p>
                  <p className="text-sm text-gray-600">কার্বোহাইড্রেট</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{product.nutritionInfo.fat}গ</p>
                  <p className="text-sm text-gray-600">চর্বি</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewSection productId={product.id} />
          )}
        </div>
      </div>

      {/* Recommendation Sections */}
      <div className="space-y-8">
        {/* Similar Products */}
        <SimilarProductsRecommendations 
          productId={product.id} 
          excludeProductIds={[product.id]}
          limit={8}
        />

        {/* Also Viewed */}
        <AlsoViewedRecommendations 
          productId={product.id} 
          excludeProductIds={[product.id]}
          limit={8}
        />

        {/* Also Bought */}
        <AlsoBoughtRecommendations 
          productId={product.id} 
          excludeProductIds={[product.id]}
          limit={8}
        />
      </div>

      {/* Fallback: Related Products from category */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">একই ক্যাটাগরির পণ্যসমূহ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}