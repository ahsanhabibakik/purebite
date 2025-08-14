import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Shield, Award, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { Testimonials } from "@/components/Testimonials";
import { products, categories } from "@/data/products";

export default function Home() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const newProducts = products.slice(0, 4);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-28 relative max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                ১০০% প্রাকৃতিক ও নিরাপদ
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                  <span className="text-green-600">পিউর বাইট</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    স্বাস্থ্যকর খাবারের
                  </span>
                  <br />
                  বিশ্বস্ত ঠিকানা
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  হোমমেড, অর্গানিক ও পুষ্টিকর খাবারের সংগ্রহ। আপনার পরিবারের স্বাস্থ্যের জন্য সেরা মানের পণ্য।
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  <Link href="/shop">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    এখনই শপিং করুন
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="text-lg px-8 py-6 border-2 hover:bg-green-50">
                  <Link href="/categories">
                    ক্যাটাগরি দেখুন
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">ফ্রি ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">১০০% নিরাপদ</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">মানের নিশ্চয়তা</span>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative order-1 lg:order-2">
              {/* Main Hero Image */}
              <div className="relative">
                <div className="aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white p-6">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Large Featured Product */}
                    <div className="col-span-2 relative rounded-2xl overflow-hidden group">
                      <Image
                        src={featuredProducts[0]?.images[0] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500"}
                        alt="Featured Product"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-bold text-lg mb-1">{featuredProducts[0]?.name || "খেজুর বাদাম হালুয়া"}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">৳{featuredProducts[0]?.price || 350}</span>
                          {featuredProducts[0]?.originalPrice && (
                            <span className="text-sm line-through opacity-75">৳{featuredProducts[0].originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          ফিচার্ড
                        </span>
                      </div>
                    </div>
                    
                    {/* Small Product Cards */}
                    {featuredProducts.slice(1, 3).map((product) => (
                      <div key={product.id} className="relative rounded-xl overflow-hidden group">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="150px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-white">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-sm font-bold">৳{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 left-0 bg-white rounded-2xl shadow-lg p-6 border border-green-100 hidden sm:block">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{products.length}+</div>
                      <div className="text-xs text-gray-600">পণ্য</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">৯৮%</div>
                      <div className="text-xs text-gray-600">সন্তুষ্ট</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Delivery Badge */}
                <div className="absolute -top-4 right-0 bg-emerald-500 text-white rounded-full p-4 shadow-lg hidden sm:block">
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs font-bold">২৪ঘন্টা</div>
                    <div className="text-xs">ডেলিভারি</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA Strip */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-green-100">
              <Phone className="w-4 h-4 text-green-600" />
              <span>যেকোনো সহায়তার জন্য কল করুন:</span>
              <span className="font-bold text-green-600">+৮৮০ ১৭৮৮ ৮৮৮ ৮৮৮</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
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
        <div className="container mx-auto px-4 max-w-7xl">
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
        <div className="container mx-auto px-4 max-w-7xl">
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
        <div className="container mx-auto px-4 max-w-7xl">
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

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <Newsletter />
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

