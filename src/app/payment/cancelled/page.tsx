"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, ShoppingCart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    setTransactionId(searchParams.get('tran_id') || "");
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        {/* Cancelled Icon */}
        <div className="mb-6">
          <AlertCircle className="h-20 w-20 text-orange-600 mx-auto mb-4" />
          <div className="w-24 h-1 bg-orange-600 mx-auto rounded-full"></div>
        </div>

        {/* Cancelled Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          পেমেন্ট বাতিল করা হয়েছে
        </h1>
        <p className="text-gray-600 mb-6">
          আপনি পেমেন্ট প্রক্রিয়া বাতিল করেছেন। আপনার কার্টের পণ্যগুলো এখনও সংরক্ষিত আছে।
        </p>

        {/* Transaction Info */}
        {transactionId && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">লেনদেন আইডি:</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">স্ট্যাটাস:</span>
                <span className="text-orange-600 font-medium">বাতিল</span>
              </div>
            </div>
          </div>
        )}

        {/* Reassurance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">চিন্তা নেই!</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• আপনার কার্টের পণ্যগুলো সংরক্ষিত আছে</li>
            <li>• কোনো টাকা কাটা হয়নি</li>
            <li>• আবার চেষ্টা করতে পারেন</li>
            <li>• বা ক্যাশ অন ডেলিভারি বেছে নিতে পারেন</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout">
              <ShoppingCart className="mr-2 h-4 w-4" />
              আবার চেকআউট করুন
            </Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/shop">কেনাকাটা চালিয়ে যান</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                হোমে ফিরুন
              </Link>
            </Button>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">পেমেন্ট অপশন:</h3>
          <div className="text-sm text-green-800 space-y-2">
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>অনলাইন পেমেন্ট (কার্ড/মোবাইল ব্যাংকিং)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💵</span>
              <span>ক্যাশ অন ডেলিভারি (ঘরে বসে পেমেন্ট)</span>
            </div>
          </div>
        </div>

        {/* Why choose us */}
        <div className="mt-6 text-sm text-gray-600">
          <p>🔒 ১০০% নিরাপদ পেমেন্ট</p>
          <p>🚚 ২৪ ঘন্টায় ডেলিভারি</p>
          <p>📞 ২৪/৭ কাস্টমার সাপোর্ট</p>
        </div>

        {/* Contact */}
        <div className="mt-6 text-sm text-gray-500">
          কোনো সমস্যা হলে কল করুন: <span className="font-semibold">০১৭১১-১২৩৪৫৬</span>
        </div>
      </div>
    </div>
  );
}