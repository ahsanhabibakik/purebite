"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowRight, RefreshCcw, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    setTransactionId(searchParams.get('tran_id') || "");
    setReason(searchParams.get('reason') || "পেমেন্ট ব্যর্থ হয়েছে");
  }, [searchParams]);

  const getFailureMessage = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'insufficient_funds':
        return "অপর্যাপ্ত ব্যালেন্স। আপনার একাউন্টে পর্যাপ্ত টাকা নেই।";
      case 'card_declined':
        return "কার্ড প্রত্যাখ্যাত। আপনার কার্ড ব্লক বা মেয়াদ শেষ হয়ে গেছে।";
      case 'network_error':
        return "নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ চেক করুন।";
      case 'verification_failed':
        return "পরিচয় যাচাইকরণ ব্যর্থ। আবার চেষ্টা করুন।";
      case 'processing_error':
        return "প্রক্রিয়াকরণ সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।";
      default:
        return reason || "পেমেন্ট সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        {/* Failed Icon */}
        <div className="mb-6">
          <XCircle className="h-20 w-20 text-red-600 mx-auto mb-4" />
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Failed Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          পেমেন্ট ব্যর্থ হয়েছে! 😞
        </h1>
        <p className="text-gray-600 mb-6">
          দুঃখিত, আপনার পেমেন্টটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h3 className="font-semibold text-red-900 mb-2">সমস্যার কারণ:</h3>
              <p className="text-sm text-red-800">
                {getFailureMessage(reason)}
              </p>
            </div>
          </div>
          
          {transactionId && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <div className="flex justify-between text-sm">
                <span className="text-red-700">লেনদেন আইডি:</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Solutions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">সমাধানের উপায়:</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• কার্ড/একাউন্টে পর্যাপ্ত টাকা আছে কিনা চেক করুন</li>
            <li>• ইন্টারনেট সংযোগ স্থিতিশীল কিনা দেখুন</li>
            <li>• অন্য পেমেন্ট পদ্ধতি ব্যবহার করে দেখুন</li>
            <li>• কিছুক্ষণ পর আবার চেষ্টা করুন</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout">
              <RefreshCcw className="mr-2 h-4 w-4" />
              আবার পেমেন্ট করুন
            </Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/shop">কেনাকাটা চালিয়ে যান</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">হোমে ফিরুন</Link>
            </Button>
          </div>
        </div>

        {/* Alternative Payment Methods */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">বিকল্প উপায়:</h3>
          <p className="text-sm text-green-800 mb-3">
            অনলাইন পেমেন্টে সমস্যা হলে ক্যাশ অন ডেলিভারি বেছে নিন
          </p>
          <Button asChild variant="outline" size="sm" className="border-green-300 text-green-700">
            <Link href="/checkout">
              ক্যাশ অন ডেলিভারি
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
            <Phone className="h-4 w-4" />
            <span>সাহায্যের জন্য কল করুন</span>
          </div>
          <div className="font-semibold text-gray-900">
            ০১৭১১-১২৩৪৫৬
          </div>
          <div className="text-sm text-gray-600">
            (২৪/৭ গ্রাহক সেবা)
          </div>
        </div>
      </div>
    </div>
  );
}