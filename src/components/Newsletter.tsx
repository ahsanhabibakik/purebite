"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, X } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus("error");
      setMessage("ইমেইল আবশ্যক");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      setMessage("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }

    setStatus("loading");
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus("success");
      setMessage("সফলভাবে সাবস্ক্রাইব হয়েছে!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const resetStatus = () => {
    setStatus("idle");
    setMessage("");
  };

  if (status === "success") {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-100">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">ধন্যবাদ!</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <p className="text-sm text-gray-500 mb-4">
          আপনি আমাদের নতুন পণ্য, অফার ও রেসিপি সম্পর্কে আপডেট পাবেন।
        </p>
        <Button variant="outline" onClick={resetStatus} size="sm">
          আরেকটি ইমেইল যোগ করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          নিউজলেটার সাবস্ক্রাইব করুন
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          নতুন পণ্য, বিশেষ অফার ও স্বাস্থ্যকর রেসিপি সম্পর্কে প্রথমেই জানুন।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="আপনার ইমেইল ঠিকানা"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              disabled={status === "loading"}
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-8 text-base font-semibold"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                অপেক্ষা করুন...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                সাবস্ক্রাইব করুন
              </>
            )}
          </Button>
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <X className="w-4 h-4" />
            {message}
          </div>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          আমরা আপনার ইমেইল শেয়ার করি না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারেন।
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-green-600 font-bold text-lg mb-1">🆕</div>
          <p className="text-sm text-gray-600">নতুন পণ্য</p>
        </div>
        <div className="text-center">
          <div className="text-green-600 font-bold text-lg mb-1">💰</div>
          <p className="text-sm text-gray-600">বিশেষ ছাড়</p>
        </div>
        <div className="text-center">
          <div className="text-green-600 font-bold text-lg mb-1">🍽️</div>
          <p className="text-sm text-gray-600">স্বাস্থ্যকর রেসিপি</p>
        </div>
      </div>
    </div>
  );
}