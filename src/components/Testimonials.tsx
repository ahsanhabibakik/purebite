"use client";

import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const testimonials = [
  {
    id: "1",
    name: "রিয়া আক্তার",
    location: "ধানমন্ডি, ঢাকা",
    rating: 5,
    comment: "পিউর বাইটের খেজুর হালুয়া অসাধারণ! সত্যিই কোন কৃত্রিম উপাদান নেই। আমার পুরো পরিবার খুব পছন্দ করেছে।",
    product: "খেজুর বাদাম হালুয়া",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
    date: "২ দিন আগে"
  },
  {
    id: "2", 
    name: "মোহাম্মদ করিম",
    location: "উত্তরা, ঢাকা",
    rating: 5,
    comment: "অর্গানিক পণ্যের জন্য এই দোকানটি আমার প্রিয়। ডেলিভারি খুব দ্রুত এবং প্যাকেজিং চমৎকার। ১০০% রেকমেন্ড করি।",
    product: "প্রিমিয়াম কাজু বাদাম",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    date: "৩ দিন আগে"
  },
  {
    id: "3",
    name: "ফাতিমা খানম", 
    location: "বনানী, ঢাকা",
    rating: 4,
    comment: "তিলের লাড্ডু খুবই সুস্বাদু। মান অনুযায়ী দাম একটু বেশি মনে হলেও গুণগত মান দেখে সন্তুষ্ট।",
    product: "পুষ্টিকর তিলের লাড্ডু",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    date: "১ সপ্তাহ আগে"
  },
  {
    id: "4",
    name: "আহমেদ হাসান",
    location: "মিরপুর, ঢাকা", 
    rating: 5,
    comment: "এনার্জি বল আমার জিমের পার্টনার। একদম ন্যাচারাল ইনগ্রিডিয়েন্ট। ওয়ার্কআউটের আগে খেলে ভালো এনার্জি পাই।",
    product: "এনার্জি বল (ডেট বাইটস)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    date: "১০ দিন আগে"
  },
  {
    id: "5",
    name: "সাবিনা আক্তার",
    location: "গুলশান, ঢাকা",
    rating: 5,
    comment: "কাস্টমার সার্ভিস অসাধারণ। একটি পণ্য নিয়ে সমস্যা হলে তৎক্ষণাত সমাধান করে দিয়েছে। এমন সেবা আজকাল বিরল।",
    product: "খাঁটি খেজুর গুড়",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", 
    date: "২ সপ্তাহ আগে"
  },
  {
    id: "6",
    name: "রাফিউল ইসলাম",
    location: "চট্টগ্রাম",
    rating: 4,
    comment: "চট্টগ্রামে ডেলিভারি ঠিক সময়েই হয়েছে। পণ্যের মান ভালো। শুধু দামটা একটু কমলে আরো ভালো হতো।",
    product: "হেলদি কম্বো প্যাক",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    date: "৩ সপ্তাহ আগে"
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            গ্রাহকদের মতামত
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            আমাদের সন্তুষ্ট গ্রাহকরা কি বলছেন তা শুনুন
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="bg-white rounded-3xl shadow-lg p-8 md:p-12 relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 text-green-200">
              <Quote className="w-12 h-12" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 mx-auto">
                  <Image
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="96px"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-100 rounded-full p-2">
                    <div className="flex">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <blockquote className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                  &quot;{currentTestimonial.comment}&quot;
                </blockquote>
                
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-gray-600">
                    {currentTestimonial.location}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                    <span>কিনেছেন:</span>
                    <span className="font-medium text-green-600">
                      {currentTestimonial.product}
                    </span>
                    <span>•</span>
                    <span>{currentTestimonial.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                className="pointer-events-auto rounded-full w-10 h-10 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                className="pointer-events-auto rounded-full w-10 h-10 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? "bg-green-600 w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">৯৮%</div>
              <div className="text-gray-600">সন্তুষ্ট গ্রাহক</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">৫০০০+</div>
              <div className="text-gray-600">খুশি গ্রাহক</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">৪.৯</div>
              <div className="text-gray-600">গড় রেটিং</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">২৪/৭</div>
              <div className="text-gray-600">সাপোর্ট</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}