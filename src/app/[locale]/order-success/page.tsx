"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (orderId) {
      // Fetch order details from API
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrderDetails(data.order);
          }
        })
        .catch(error => {
          console.error('Failed to fetch order details:', error);
        });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            অর্ডার সফল হয়েছে!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">অর্ডার বিবরণ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">অর্ডার নাম্বার</p>
                <p className="font-medium">{transactionId || orderId}</p>
              </div>
              
              {amount && (
                <div>
                  <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                  <p className="font-medium">৳{amount}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">অর্ডারের তারিখ</p>
                <p className="font-medium">{new Date().toLocaleDateString('bn-BD')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">স্ট্যাটাস</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  নিশ্চিত
                </span>
              </div>
            </div>

            {orderDetails && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">অর্ডার করা পণ্য</h3>
                <div className="space-y-2">
                  {orderDetails.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              যোগাযোগের তথ্য
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

          {/* Expected Delivery */}
          <div className="bg-orange-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-orange-800 mb-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">প্রত্যাশিত ডেলিভারি</span>
            </div>
            <p className="text-orange-700">
              আগামী ২৪-৪৮ ঘন্টার মধ্যে
            </p>
            <p className="text-sm text-orange-600 mt-2">
              * ঢাকার ভিতরে সাধারণত ২৪ ঘন্টা, ঢাকার বাইরে ৪৮ ঘন্টা সময় লাগে
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/bn">
                আরও কেনাকাটা করুন
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/bn/account/orders">
                আমার অর্ডার দেখুন
              </Link>
            </Button>
          </div>

          {/* Order Tracking Note */}
          <div className="mt-8 text-sm text-gray-600">
            <p>
              আপনার অর্ডার ট্র্যাক করতে আমাদের ওয়েবসাইটে লগইন করুন অথবা 
              আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}