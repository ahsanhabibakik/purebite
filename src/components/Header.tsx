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
import { NotificationSystem } from "@/components/notifications/NotificationSystem";
import { QuickThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const t = useTranslations('navigation');
  const { toggleCart, getTotalItems } = useCartStore();
  const { getTotalItems: getWishlistItems } = useWishlistStore();
  const { getTotalItems: getComparisonItems } = useComparisonStore();
  const totalItems = getTotalItems();
  const wishlistItems = getWishlistItems();
  const comparisonItems = getComparisonItems();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white font-bold shadow-lg">
                P
              </div>
              <span className="text-xl font-bold text-green-600 hidden sm:block">PureBite</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
                {t('home')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
                {t('shop')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
                {t('categories')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
                ব্লগ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
                {t('about')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
                {t('contact')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex hover:bg-green-50 hover:text-green-600 transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-red-50 hover:text-red-600 transition-colors"
                asChild
              >
                <Link href="/wishlist">
                  <Heart className="h-4 w-4" />
                  {wishlistItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white animate-pulse">
                      {wishlistItems}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Comparison */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-blue-50 hover:text-blue-600 transition-colors hidden sm:flex"
                asChild
              >
                <Link href="/compare">
                  <Scale className="h-4 w-4" />
                  {comparisonItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white animate-pulse">
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
                className="relative hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white animate-bounce">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Notifications (for logged in users) */}
              <NotificationSystem />

              {/* Theme Toggle */}
              <QuickThemeToggle />

              {/* Language Switcher */}
              <LanguageSwitcher variant="button" showLabel={false} />

              {/* User Account */}
              <AuthButton />

              {/* Mobile Menu */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur-md">
            <div className="px-4 py-2 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link 
                href="/shop" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('shop')}
              </Link>
              <Link 
                href="/categories" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('categories')}
              </Link>
              <Link 
                href="/blog" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ব্লগ
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('contact')}
              </Link>
              
              {/* Mobile Search */}
              <button 
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Search className="h-4 w-4 inline mr-2" />
                খুঁজুন
              </button>
            </div>
          </div>
        )}
      </header>
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}

