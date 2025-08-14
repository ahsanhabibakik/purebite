import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Truck, Shield, Award, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/data/products";

export default function Home() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const newProducts = products.slice(0, 4);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container px-4 py-12 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-green-600">পিউর</span> ও <span className="text-green-600">স্বাস্থ্যকর</span>
                <br />
                খাবারের ঠিকানা
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                ১০০% প্রাকৃতিক, হোমমেড ও পুষ্টিকর খাবারের বিশাল সংগ্রহ। 
                আপনার পরিবারের স্বাস্থ্যের কথা মাথায় রেখে বাছাই করা প্রতিটি পণ্য।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/shop">
                    এখনই কিনুন
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="text-lg px-8">
                  <Link href="/categories">
                    ক্যাটাগরি দেখুন
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{products.length}+</div>
                  <div className="text-sm text-gray-600">পণ্য</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">২৪ঘন্টা</div>
                  <div className="text-sm text-gray-600">ডেলিভারি</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">৯৮%</div>
                  <div className="text-sm text-gray-600">সন্তুষ্ট গ্রাহক</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <div
                    key={product.id}
                    className={`relative aspect-square overflow-hidden rounded-2xl ${
                      index === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <Image
                      src={product.images[0] || "/placeholder-product.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes={index === 0 ? "400px" : "200px"}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end p-4">
                      <div className="text-white">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm">৳{product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">আমাদের ক্যাটাগরিসমূহ</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              বিভিন্ন ধরনের স্বাস্থ্যকর ও পুষ্টিকর খাবারের সংগ্রহ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const categoryProductCount = products.filter(p => p.category === category.id).length;
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={category.image || "/placeholder-category.jpg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm">{categoryProductCount} টি পণ্য</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">ফিচার্ড পণ্যসমূহ</h2>
              <p className="text-gray-600">আমাদের বিশেষভাবে নির্বাচিত জনপ্রিয় পণ্য</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop?featured=true">
                সব দেখুন
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">কেন PureBite?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              আমরা গুণগত মান ও গ্রাহক সন্তুষ্টিতে প্রতিশ্রুতিবদ্ধ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">দ্রুত ডেলিভারি</h3>
              <p className="text-gray-600">ঢাকার ভিতরে ২৪ ঘন্টায় পৌঁছে দেওয়া</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">গুণগত মানের নিশ্চয়তা</h3>
              <p className="text-gray-600">১০০% খাঁটি ও প্রাকৃতিক পণ্য</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">পুরস্কারপ্রাপ্ত সেবা</h3>
              <p className="text-gray-600">সর্বোচ্চ গ্রাহক সন্তুষ্টি</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">২৪/৭ সাপোর্ট</h3>
              <p className="text-gray-600">যেকোনো সময় যোগাযোগ করুন</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">নতুন পণ্যসমূহ</h2>
              <p className="text-gray-600">সবার আগে দেখুন আমাদের নতুন সংযোজন</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop?sort=newest">
                আরও দেখুন
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            এখনই শুরু করুন স্বাস্থ্যকর জীবনযাত্রা
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            আজই অর্ডার করুন এবং পেয়ে যান ৫০০ টাকার উপরে ফ্রি ডেলিভারি
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/shop">
                এখনই কিনুন
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-green-600">
              <Link href="/contact">
                যোগাযোগ করুন
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

