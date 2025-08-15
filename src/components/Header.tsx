"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useTranslations } from 'next-intl';
import { Search, ShoppingCart, Menu, Heart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useComparisonStore } from "@/store/comparison";
import { SearchModal } from "@/components/SearchModal";
import { AuthButton } from "@/components/auth/AuthButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const t = useTranslations('navigation');
  const { toggleCart, getTotalItems } = useCartStore();
  const { getTotalItems: getWishlistItems } = useWishlistStore();
  const { getTotalItems: getComparisonItems } = useComparisonStore();
  const totalItems = getTotalItems();
  const wishlistItems = getWishlistItems();
  const comparisonItems = getComparisonItems();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white font-bold">
            P
          </div>
          <span className="text-xl font-bold text-green-600">PureBite</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-green-600 transition-colors">
            {t('home')}
          </Link>
          <Link href="/shop" className="text-sm font-medium hover:text-green-600 transition-colors">
            {t('shop')}
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-green-600 transition-colors">
            {t('categories')}
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:text-green-600 transition-colors">
            ব্লগ
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-green-600 transition-colors">
            {t('about')}
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-green-600 transition-colors">
            {t('contact')}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-4 w-4" />
              {wishlistItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {wishlistItems}
                </span>
              )}
            </Link>
          </Button>

          {/* Comparison */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            asChild
          >
            <Link href="/compare">
              <Scale className="h-4 w-4" />
              {comparisonItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                  {comparisonItems}
                </span>
              )}
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCart}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher variant="button" showLabel={false} />

          {/* User Account */}
          <AuthButton />

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
}

