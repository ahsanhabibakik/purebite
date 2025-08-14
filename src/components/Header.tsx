"use client";

import Link from "next/link";
import React from "react";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

export function Header() {
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

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
            হোম
          </Link>
          <Link href="/shop" className="text-sm font-medium hover:text-green-600 transition-colors">
            শপ
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-green-600 transition-colors">
            ক্যাটাগরি
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-green-600 transition-colors">
            আমাদের সম্পর্কে
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-green-600 transition-colors">
            যোগাযোগ
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
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

          {/* User Account */}
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
