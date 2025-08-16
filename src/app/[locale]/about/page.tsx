"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Users, Award, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              PureBite সম্পর্কে
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              আমরা বাংলাদেশের একটি বিশ্বস্ত অনলাইন খাদ্য ব্র্যান্ড যা স্বাস্থ্যকর, 
              তাজা এবং গুণগত খাবার সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।
            </p>
            <Button asChild size="lg">
              <Link href="/bn/shop">
                আমাদের পণ্য দেখুন
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                আমাদের লক্ষ্য ও উদ্দেশ্য
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">স্বাস্থ্য প্রথম</h3>
                    <p className="text-gray-600">
                      আমাদের প্রতিটি পণ্য স্বাস্থ্যকর উপাদান দিয়ে তৈরি। কোন কৃত্রিম 
                      রং, স্বাদ বা প্রিজারভেটিভ ব্যবহার করি না।
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">প্রাকৃতিক উপাদান</h3>
                    <p className="text-gray-600">
                      আমরা স্থানীয় কৃষকদের থেকে সরাসরি তাজা উপাদান সংগ্রহ করি 
                      এবং প্রাকৃতিক পদ্ধতিতে প্রক্রিয়াজাত করি।
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">সম্প্রদায়ের উন্নতি</h3>
                    <p className="text-gray-600">
                      আমাদের ব্যবসার মাধ্যমে স্থানীয় কৃষক ও উৎপাদকদের 
                      আর্থিক উন্নতিতে সহায়তা করি।
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
                alt="Fresh organic vegetables"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              আমাদের গল্প
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-center text-xl leading-relaxed mb-8">
                ২০২০ সালে করোনা মহামারীর সময় যখন মানুষ স্বাস্থ্যকর খাবারের 
                গুরুত্ব বুঝতে শুরু করল, তখনই PureBite এর যাত্রা শুরু।
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">শুরুর কথা</h3>
                  <p>
                    আমাদের প্রতিষ্ঠাতা মোহাম্মদ করিম যখন দেখলেন যে বাজারে 
                    স্বাস্থ্যকর ও বিশুদ্ধ খাবারের অভাব রয়েছে, তখন তিনি 
                    তার পরিবার ও বন্ধুদের নিয়ে PureBite শুরু করার সিদ্ধান্ত নেন।
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">আজকের অবস্থা</h3>
                  <p>
                    আজ আমরা ঢাকা ও চট্টগ্রামের হাজারো পরিবারের কাছে 
                    স্বাস্থ্যকর খাবার পৌঁছে দিচ্ছি এবং ৫০+ স্থানীয় 
                    উৎপাদকের সাথে কাজ করছি।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            আমাদের অর্জন
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">৫,০০০+</div>
              <p className="text-gray-600">সন্তুষ্ট গ্রাহক</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">১০০+</div>
              <p className="text-gray-600">বিভিন্ন পণ্য</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">৫০+</div>
              <p className="text-gray-600">স্থানীয় উৎপাদক</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">৯৮%</div>
              <p className="text-gray-600">গ্রাহক সন্তুষ্টি</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            আমাদের টিম
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">মোহাম্মদ করিম</h3>
              <p className="text-green-600 mb-2">প্রতিষ্ঠাতা ও CEO</p>
              <p className="text-gray-600 text-sm">
                খাদ্য বিজ্ঞানে স্নাতক, ১০+ বছরের অভিজ্ঞতা
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ফাতেমা খাতুন</h3>
              <p className="text-green-600 mb-2">গুণগত নিয়ন্ত্রণ প্রধান</p>
              <p className="text-gray-600 text-sm">
                পুষ্টিবিদ, খাদ্য নিরাপত্তা বিশেষজ্ঞ
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">আব্দুল রহমান</h3>
              <p className="text-green-600 mb-2">সাপ্লাই চেইন ম্যানেজার</p>
              <p className="text-gray-600 text-sm">
                কৃষি বিজ্ঞানে স্নাতক, কৃষক সম্পর্ক বিশেষজ্ঞ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              আমাদের সাথে যোগ দিন
            </h2>
            <p className="text-xl text-green-100 mb-8">
              স্বাস্থ্যকর খাবারের এই যাত্রায় আমাদের সাথে থাকুন
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5" />
                <span>০১৭০০০০০০০০</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5" />
                <span>info@purebite.com</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="h-5 w-5" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <Link href="/bn/contact">
                  যোগাযোগ করুন
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600">
                <Link href="/bn/shop">
                  কেনাকাটা শুরু করুন
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}