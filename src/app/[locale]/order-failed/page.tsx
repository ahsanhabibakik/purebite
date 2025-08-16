"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, Phone, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderFailedPage() {
  const searchParams = useSearchParams();
  
  const transactionId = searchParams.get('transactionId');
  const reason = searchParams.get('reason');

  const getErrorMessage = (reason: string | null) => {
    switch (reason) {
      case 'verification_failed':
        return 'পেমেন্ট যাচাইকরণ ব্যর্থ হয়েছে';
      case 'processing_error':
        return 'পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে';
      case 'order_not_found':
        return 'অর্ডার খুঁজে পাওয়া যায়নি';
      case 'invalid_payment':
        return 'অবৈধ পেমেন্ট তথ্য';
      default:
        return 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-20 w-20 text-red-600 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            অর্ডার ব্যর্থ হয়েছে
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {getErrorMessage(reason)}। দুঃখিত, আপনার অর্ডার সম্পন্ন করা যায়নি।
          </p>

          {/* Error Details */}
          {(transactionId || reason) && (
            <div className="bg-red-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-red-900 mb-4">
                ত্রুটির বিবরণ
              </h2>
              
              <div className="space-y-2">
                {transactionId && (
                  <div>
                    <p className="text-sm text-red-700">লেনদেন নাম্বার</p>
                    <p className="font-medium text-red-900">{transactionId}</p>
                  </div>
                )}
                
                {reason && (
                  <div>
                    <p className="text-sm text-red-700">ত্রুটির ধরন</p>
                    <p className="font-medium text-red-900">{getErrorMessage(reason)}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-red-700">তারিখ</p>
                  <p className="font-medium text-red-900">{new Date().toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-yellow-800 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">কী করবেন?</span>
            </div>
            <div className="text-left space-y-3 text-yellow-700">
              <p>• ইন্টারনেট সংযোগ পরীক্ষা করুন</p>
              <p>• ব্রাউজার রিফ্রেশ করুন এবং আবার চেষ্টা করুন</p>
              <p>• পেমেন্ট কার্ডে যথেষ্ট ব্যালেন্স আছে কিনা নিশ্চিত করুন</p>
              <p>• সমস্যা অব্যাহত থাকলে আমাদের সাথে যোগাযোগ করুন</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              সাহায্যের জন্য যোগাযোগ করুন
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
            <p className="text-sm text-blue-600 mt-4">
              আমাদের কাস্টমার সার্ভিস ২৪/৭ আপনার সেবায় প্রস্তুত
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/bn">
                <RefreshCw className="h-4 w-4 mr-2" />
                আবার চেষ্টা করুন
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/bn/cart">
                কার্টে ফিরে যান
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/bn/contact">
                যোগাযোগ করুন
              </Link>
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-sm text-gray-600">
            <p>
              যদি একাধিকবার চেষ্টা করার পরও সমস্যা হয়, তাহলে দয়া করে আমাদের 
              কাস্টমার সার্ভিসে কল করুন অথবা ইমেইল পাঠান।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}