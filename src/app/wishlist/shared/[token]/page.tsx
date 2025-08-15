'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, User, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';

interface SharedWishlistData {
  id: string;
  shareToken: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  expiresAt?: string;
  viewCount: number;
  lastViewAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    image: string;
    inStock: boolean;
    createdAt: string;
  }>;
}

export default function SharedWishlistPage() {
  const params = useParams();
  const token = params.token as string;
  const { addItem } = useCartStore();
  const [wishlist, setWishlist] = useState<SharedWishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchSharedWishlist();
    }
  }, [token]);

  const fetchSharedWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist/share/${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('উইশলিস্ট পাওয়া যায়নি বা মেয়াদ শেষ');
        } else {
          setError('উইশলিস্ট লোড করতে সমস্যা হয়েছে');
        }
        return;
      }

      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching shared wishlist:', error);
      setError('উইশলিস্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      images: [product.image],
      inStock: product.inStock,
      category: '',
      rating: 0,
      reviewCount: 0,
      tags: [],
      description: '',
      createdAt: product.createdAt,
      updatedAt: product.createdAt,
    };
    
    addItem(cartProduct, 1);
    alert('পণ্যটি কার্টে যোগ করা হয়েছে!');
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'উইশলিস্ট পাওয়া যায়নি'}
          </h1>
          <p className="text-gray-600 mb-8">
            এই উইশলিস্টটি আর উপলব্ধ নেই বা মেয়াদ শেষ হয়ে গেছে
          </p>
          <Button asChild>
            <Link href="/">হোমে ফিরে যান</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{wishlist.title}</h1>
          {wishlist.isPublic && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              পাবলিক উইশলিস্ট
            </span>
          )}
        </div>

        {wishlist.description && (
          <p className="text-gray-600 mb-4">{wishlist.description}</p>
        )}

        {/* Wishlist Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{wishlist.user.name || wishlist.user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{wishlist.viewCount} বার দেখা হয়েছে</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>তৈরি: {new Date(wishlist.createdAt).toLocaleDateString('bn-BD')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>{wishlist.products.length}টি পণ্য</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {wishlist.products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            কোনো পণ্য নেই
          </h2>
          <p className="text-gray-600 mb-8">
            এই উইশলিস্টে এখনো কোনো পণ্য যোগ করা হয়নি
          </p>
          <Button asChild>
            <Link href="/shop">আমাদের শপ দেখুন</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">স্টক নেই</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/products/${product.id}`}>
                      বিস্তারিত
                    </Link>
                  </Button>
                  
                  {product.inStock ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-1"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      কার্ট
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="flex items-center gap-1"
                    >
                      স্টক নেই
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="mt-16 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          নিজের উইশলিস্ট তৈরি করুন
        </h3>
        <p className="text-blue-800 mb-4">
          আপনিও আপনার পছন্দের পণ্যগুলো সংগ্রহ করে একটি উইশলিস্ট তৈরি করতে পারেন এবং
          বন্ধুদের সাথে শেয়ার করতে পারেন।
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/auth/register">সাইন আপ করুন</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">শপিং করুন</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}