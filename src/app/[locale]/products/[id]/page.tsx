"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Scale,
  Package,
  Clock,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useComparisonStore } from "@/store/comparison";

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
  stockCount?: number;
  averageRating?: number;
  reviewCount?: number;
  featured?: boolean;
  weight?: string;
  unit?: string;
  origin?: string;
  expiryDays?: number;
  ingredients?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem, openCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToComparison, isInComparison } = useComparisonStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          
          // Fetch related products
          if (productData.category) {
            const relatedResponse = await fetch(`/api/products?category=${productData.category}&limit=4`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              setRelatedProducts(relatedData.products.filter((p: Product) => p.id !== productId));
            }
          }
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem({ ...product, quantity });
      openCart();
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };

  const handleAddToComparison = () => {
    if (product) {
      addToComparison(product);
    }
  };

  const discountPercentage = product?.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const currentPrice = product?.salePrice || product?.price || 0;
  const originalPrice = product?.salePrice ? product.price : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">পণ্য পাওয়া যায়নি</h1>
        <p className="text-gray-600 mb-6">এই পণ্যটি বর্তমানে উপলব্ধ নেই বা মুছে ফেলা হয়েছে।</p>
        <Button asChild>
          <Link href="/bn/shop">সব পণ্য দেখুন</Link>
        </Button>
      </div>
    );
  }

  const images = product.images || (product.image ? [product.image] : ['/placeholder-product.jpg']);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/bn" className="hover:text-green-600">হোম</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/bn/shop" className="hover:text-green-600">শপ</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discountPercentage > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500">
                {discountPercentage}% ছাড়
              </Badge>
            )}
            {product.featured && (
              <Badge className="absolute top-4 right-4 bg-blue-500">
                ফিচার্ড
              </Badge>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-green-500' : 'border-gray-200'
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {product.averageRating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.averageRating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount || 0} রিভিউ)
                  </span>
                </div>
              )}
              <Badge variant="outline">{product.category}</Badge>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-green-600">
              ৳{currentPrice}
            </span>
            {originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                ৳{originalPrice}
              </span>
            )}
            {product.unit && (
              <span className="text-gray-600">/ {product.unit}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">স্টকে আছে</span>
                {product.stockCount && (
                  <span className="text-gray-500">({product.stockCount} টি বাকি)</span>
                )}
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">স্টকে নেই</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">পরিমাণ:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                  disabled={!product.inStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                কার্টে যোগ করুন
              </Button>
              
              <Button
                onClick={handleWishlistToggle}
                variant="outline"
                size="lg"
                className={isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                onClick={handleAddToComparison}
                variant="outline"
                size="lg"
                disabled={isInComparison(product.id)}
              >
                <Scale className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">ফ্রি ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">নিরাপদ পেমেন্ট</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">৭ দিন রিটার্ন</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">গুণগত নিশ্চয়তা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">বিস্তারিত</TabsTrigger>
            <TabsTrigger value="nutrition">পুষ্টি তথ্য</TabsTrigger>
            <TabsTrigger value="reviews">রিভিউ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">পণ্যের তথ্য</h3>
                  <div className="space-y-3">
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ওজন:</span>
                        <span className="font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.origin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">উৎপাদনস্থল:</span>
                        <span className="font-medium">{product.origin}</span>
                      </div>
                    )}
                    {product.expiryDays && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">মেয়াদ:</span>
                        <span className="font-medium">{product.expiryDays} দিন</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {product.ingredients && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">উপাদান</h3>
                    <ul className="space-y-2">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              {product.nutritionInfo ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(product.nutritionInfo).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{value}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key === 'calories' ? 'ক্যালোরি' :
                         key === 'protein' ? 'প্রোটিন (গ্রাম)' :
                         key === 'carbs' ? 'কার্বোহাইড্রেট (গ্রাম)' :
                         key === 'fat' ? 'চর্বি (গ্রাম)' :
                         key === 'fiber' ? 'ফাইবার (গ্রাম)' : key}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  পুষ্টি তথ্য এখনো যোগ করা হয়নি
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="text-center text-gray-500 py-8">
                রিভিউ সিস্টেম শীঘ্রই যোগ করা হবে
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            সম্পর্কিত পণ্য
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/bn/products/${relatedProduct.id}`}
                className="group bg-white rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={relatedProduct.image || relatedProduct.images?.[0] || '/placeholder-product.jpg'}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      ৳{relatedProduct.salePrice || relatedProduct.price}
                    </span>
                    {relatedProduct.averageRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {relatedProduct.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}