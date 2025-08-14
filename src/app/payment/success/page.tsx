"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    setTransactionId(searchParams.get('tran_id') || "");
    setAmount(searchParams.get('amount') || "");
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          পেমেন্ট সফল হয়েছে! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
        </p>

        {/* Transaction Details */}
        {transactionId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">লেনদেন আইডি:</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
              {amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">পেমেন্ট পরিমাণ:</span>
                  <span className="font-semibold text-green-600">৳{amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">স্ট্যাটাস:</span>
                <span className="text-green-600 font-medium">✓ সফল</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">পরবর্তী ধাপ:</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• আমরা আপনার অর্ডার প্রস্তুত করা শুরু করেছি</li>
            <li>• ১-২ ঘন্টার মধ্যে কনফার্মেশন কল পাবেন</li>
            <li>• ২৪ ঘন্টার মধ্যে ডেলিভারি হবে</li>
            <li>• SMS এ ট্র্যাকিং তথ্য পাবেন</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/orders">
              অর্ডার ট্র্যাক করুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/shop">আরও কেনাকাটা</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">হোমে ফিরুন</Link>
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
            <Phone className="h-4 w-4" />
            <span>কোন সমস্যা হলে কল করুন</span>
          </div>
          <div className="font-semibold text-gray-900">
            ০১৭১১-১২৩৪৫৬
          </div>
          <div className="text-sm text-gray-600">
            (২৪/৭ গ্রাহক সেবা)
          </div>
        </div>

        {/* Receipt Download */}
        {transactionId && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" className="text-blue-600">
              <Download className="mr-2 h-4 w-4" />
              রসিদ ডাউনলোড করুন
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}