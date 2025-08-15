"use client";

import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Share2, Copy, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SharedWishlist {
  id: string;
  shareToken: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  shareUrl: string;
}

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items, clearWishlist, getTotalItems } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const totalItems = getTotalItems();
  const [sharedWishlists, setSharedWishlists] = useState<SharedWishlist[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchSharedWishlists();
    }
  }, [session]);

  const fetchSharedWishlists = async () => {
    try {
      const response = await fetch('/api/wishlist/share');
      if (response.ok) {
        const data = await response.json();
        setSharedWishlists(data);
      }
    } catch (error) {
      console.error('Error fetching shared wishlists:', error);
    }
  };

  const handleAddAllToCart = () => {
    items.forEach(product => {
      addItem(product, 1);
    });
  };

  const createSharedWishlist = async (data: {
    title: string;
    description?: string;
    isPublic: boolean;
  }) => {
    if (totalItems === 0) {
      alert('উইশলিস্ট খালি, প্রথমে কিছু পণ্য যোগ করুন');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const sharedWishlist = await response.json();
        setSharedWishlists([sharedWishlist, ...sharedWishlists]);
        setShowShareModal(false);
        alert('উইশলিস্ট শেয়ার করা হয়েছে!');
      } else {
        const error = await response.json();
        alert(error.error || 'উইশলিস্ট শেয়ার করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error creating shared wishlist:', error);
      alert('উইশলিস্ট শেয়ার করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('লিংক কপি হয়েছে!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deleteSharedWishlist = async (shareToken: string) => {
    if (!confirm('আপনি কি এই শেয়ার করা উইশলিস্ট মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`/api/wishlist/share/${shareToken}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSharedWishlists(sharedWishlists.filter(w => w.shareToken !== shareToken));
        alert('শেয়ার করা উইশলিস্ট মুছে ফেলা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting shared wishlist:', error);
      alert('মুছতে সমস্যা হয়েছে');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">উইশলিস্ট দেখতে লগইন করুন</h1>
        <p className="text-gray-600 mb-6">
          আপনার পছন্দের পণ্যগুলো সেভ করতে প্রথমে লগইন করুন
        </p>
        <Button asChild>
          <Link href="/">হোমে ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">আমার উইশলিস্ট</h1>
          <p className="text-gray-600">
            {totalItems > 0 ? `${totalItems}টি পণ্য আপনার উইশলিস্টে আছে` : 'আপনার উইশলিস্ট খালি'}
          </p>
        </div>
        
        {totalItems > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              শেয়ার করুন
            </Button>
            {sharedWishlists.length > 0 && (
              <Button
                onClick={() => setShowManageModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                শেয়ার ম্যানেজ করুন
              </Button>
            )}
            <Button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              সব কার্টে যোগ করুন
            </Button>
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              সব মুছে দিন
            </Button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {totalItems === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            আপনার উইশলিস্ট খালি
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            আপনার পছন্দের পণ্যগুলো উইশলিস্টে যোগ করুন যাতে পরে সহজেই খুঁজে পান।
            পণ্যের হার্ট আইকনে ক্লিক করে উইশলিস্টে যোগ করুন।
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/shop">এখনই শপিং করুন</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">ক্যাটাগরি ব্রাউজ করুন</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Recommended Products */}
      {totalItems === 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            আপনার পছন্দ হতে পারে
          </h3>
          <div className="text-center text-gray-500 py-8">
            <p>আরও পণ্য দেখতে আমাদের শপ পেইজ ভিজিট করুন</p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareWishlistModal
          onClose={() => setShowShareModal(false)}
          onShare={createSharedWishlist}
          loading={loading}
        />
      )}

      {/* Manage Shared Wishlists Modal */}
      {showManageModal && (
        <ManageSharedWishlistsModal
          sharedWishlists={sharedWishlists}
          onClose={() => setShowManageModal(false)}
          onCopyLink={copyToClipboard}
          onDelete={deleteSharedWishlist}
        />
      )}
    </div>
  );
}

interface ShareWishlistModalProps {
  onClose: () => void;
  onShare: (data: { title: string; description?: string; isPublic: boolean }) => void;
  loading: boolean;
}

function ShareWishlistModal({ onClose, onShare, loading }: ShareWishlistModalProps) {
  const [title, setTitle] = useState('আমার উইশলিস্ট');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShare({ title, description: description || undefined, isPublic });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">উইশলিস্ট শেয়ার করুন</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              শিরোনাম *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              বিবরণ
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="আপনার উইশলিস্ট সম্পর্কে কিছু লিখুন..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              পাবলিক করুন (সবাই দেখতে পাবে)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
            >
              {loading ? 'শেয়ার হচ্ছে...' : 'শেয়ার করুন'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ManageSharedWishlistsModalProps {
  sharedWishlists: SharedWishlist[];
  onClose: () => void;
  onCopyLink: (url: string) => void;
  onDelete: (shareToken: string) => void;
}

function ManageSharedWishlistsModal({ 
  sharedWishlists, 
  onClose, 
  onCopyLink, 
  onDelete 
}: ManageSharedWishlistsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">শেয়ার করা উইশলিস্ট</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {sharedWishlists.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            কোনো শেয়ার করা উইশলিস্ট নেই
          </p>
        ) : (
          <div className="space-y-4">
            {sharedWishlists.map((wishlist) => (
              <div
                key={wishlist.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{wishlist.title}</h3>
                    {wishlist.description && (
                      <p className="text-sm text-gray-600 mt-1">{wishlist.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {wishlist.isPublic && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        পাবলিক
                      </span>
                    )}
                    {wishlist.isActive ? (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  <span>{wishlist.viewCount} বার দেখা হয়েছে</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(wishlist.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={wishlist.shareUrl}
                    readOnly
                    className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-1 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopyLink(wishlist.shareUrl)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    কপি
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(wishlist.shareToken)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    মুছুন
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>বন্ধ করুন</Button>
        </div>
      </div>
    </div>
  );
}