"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ShoppingCart, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderCancelledPage() {
  const searchParams = useSearchParams();
  
  const transactionId = searchParams.get('transactionId');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-20 w-20 text-orange-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            অর্ডার বাতিল হয়েছে
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            আপনার পেমেন্ট প্রক্রিয়া বাতিল করা হয়েছে। কোন টাকা কেটে নেওয়া হয়নি।
          </p>

          {/* Cancellation Details */}
          {transactionId && (
            <div className="bg-orange-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-orange-900 mb-4">
                বাতিলের বিবরণ
              </h2>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-orange-700">লেনদেন নাম্বার</p>
                  <p className="font-medium text-orange-900">{transactionId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-orange-700">বাতিলের তারিখ</p>
                  <p className="font-medium text-orange-900">{new Date().toLocaleDateString('bn-BD')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-orange-700">স্ট্যাটাস</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    বাতিল
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* No Charge Notice */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ✅ আপনার অ্যাকাউন্ট নিরাপদ
            </h3>
            <p className="text-green-700">
              পেমেন্ট বাতিল হওয়ায় আপনার কোন টাকা কাটা হয়নি। 
              আপনার অ্যাকাউন্ট সম্পূর্ণ নিরাপদ।
            </p>
          </div>

          {/* Why Orders Get Cancelled */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              কেন অর্ডার বাতিল হতে পারে?
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• পেমেন্ট প্রক্রিয়ার সময় ব্যাক বাটন চাপা</li>
              <li>• ইন্টারনেট সংযোগ বিচ্ছিন্ন হওয়া</li>
              <li>• পেমেন্ট পেইজে দীর্ঘ সময় নিষ্ক্রিয় থাকা</li>
              <li>• ব্রাউজার বন্ধ করে দেওয়া</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              সাহায্যের প্রয়োজন?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Phone className="h-4 w-4" />
                <span>হটলাইন: ০১৭০০০০০০০০</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Mail className="h-4 w-4" />
                <span>ইমেইল: support@purebite.com</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/bn/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                আবার চেষ্টা করুন
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/bn">
                হোমে ফিরে যান
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/bn/contact">
                যোগাযোগ করুন
              </Link>
            </Button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-sm text-gray-600">
            <p>
              আপনার কার্টের পণ্যগুলো সংরক্ষিত আছে। আপনি চাইলে আবার 
              অর্ডার করতে পারেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}