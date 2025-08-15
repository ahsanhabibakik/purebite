"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const faqData = [
  {
    id: "1",
    category: "অর্ডার ও ডেলিভারি",
    question: "কত সময়ে পণ্য ডেলিভারি হয়?",
    answer: "ঢাকার ভিতরে ২৪ ঘন্টার মধ্যে এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে ডেলিভারি করা হয়। জরুরি অর্ডারের জন্য ৬-৮ ঘন্টার মধ্যে এক্সপ্রেস ডেলিভারি সেবা আছে।"
  },
  {
    id: "2",
    category: "অর্ডার ও ডেলিভারি",
    question: "ডেলিভারি চার্জ কত?",
    answer: "ঢাকার ভিতরে ৮০ টাকা এবং ঢাকার বাইরে ১৫০ টাকা। ১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি।"
  },
  {
    id: "3",
    category: "অর্ডার ও ডেলিভারি",
    question: "অর্ডার ট্র্যাক করতে পারব?",
    answer: "হ্যাঁ, অর্ডার করার পর আপনি SMS ও আমাদের ওয়েবসাইটে 'আমার অর্ডার' সেকশনে গিয়ে অর্ডার ট্র্যাক করতে পারবেন।"
  },
  {
    id: "4",
    category: "পেমেন্ট",
    question: "কি কি পেমেন্ট মেথড আছে?",
    answer: "আমরা ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার সুবিধা দিয়ে থাকি।"
  },
  {
    id: "5",
    category: "পেমেন্ট",
    question: "অ্যাডভান্স পেমেন্ট করলে কি ছাড় পাব?",
    answer: "হ্যাঁ, অ্যাডভান্স পেমেন্টে ৫% ছাড় পাবেন। বিকাশ/নগদে পেমেন্ট করলে ৩% অতিরিক্ত ছাড়।"
  },
  {
    id: "6",
    category: "পণ্যের মান",
    question: "পণ্যের মান নিয়ে কোন সমস্যা হলে?",
    answer: "আমাদের ১০০% মানি ব্যাক গ্যারান্টি আছে। পণ্য ডেলিভারির ২৪ ঘন্টার মধ্যে কোন সমস্যা থাকলে ফেরত দিতে পারবেন।"
  },
  {
    id: "7",
    category: "পণ্যের মান",
    question: "পণ্যগুলো কি সত্যিই অর্গানিক?",
    answer: "হ্যাঁ, আমাদের সব পণ্য সার্টিফাইড অর্গানিক। প্রতিটি পণ্যের সাথে অর্গানিক সার্টিফিকেট দেওয়া হয়।"
  },
  {
    id: "8",
    category: "অ্যাকাউন্ট",
    question: "অ্যাকাউন্ট তৈরি করা কি জরুরি?",
    answer: "না, গেস্ট হিসেবেও অর্ডার করতে পারবেন। তবে অ্যাকাউন্ট থাকলে অর্ডার হিস্টরি, উইশলিস্ট ও বিশেষ ছাড়ের সুবিধা পাবেন।"
  },
  {
    id: "9",
    category: "রিটার্ন ও রিফান্ড",
    question: "পণ্য ফেরত দেওয়ার নিয়ম কি?",
    answer: "পণ্য রিসিভের ২৪ ঘন্টার মধ্যে ফেরত দিতে পারবেন। পণ্য অবশ্যই অব্যবহৃত অবস্থায় থাকতে হবে।"
  },
  {
    id: "10",
    category: "রিটার্ন ও রিফান্ড", 
    question: "রিফান্ড কত সময়ে পাব?",
    answer: "রিটার্ন প্রসেসিং সম্পন্ন হওয়ার ৫-৭ কার্যদিবসের মধ্যে রিফান্ড পেয়ে যাবেন।"
  }
];

const categories = [
  "সব",
  "অর্ডার ও ডেলিভারি",
  "পেমেন্ট",
  "পণ্যের মান",
  "অ্যাকাউন্ট",
  "রিটার্ন ও রিফান্ড"
];

export function FAQClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "সব" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          সাধারণত জিজ্ঞাসিত প্রশ্নাবলী
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          আপনার প্রশ্নের উত্তর এখানে খুঁজে পান। আরও সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="প্রশ্ন খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-gray-500 mb-4">
              আপনার খোঁজার সাথে কোন প্রশ্ন মিলেনি। অন্য কিছু খুঁজে দেখুন।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-green-600 font-medium mb-1">
                        {faq.category}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          আপনার প্রশ্নের উত্তর পাননি?
        </h2>
        <p className="text-gray-600 mb-6">
          আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমরা সাহায্য করতে প্রস্তুত।
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4" />
            +৮৮০ ১৭৮৮ ৮৮৮ ৮৮৮
          </Button>
          <Button variant="outline" className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            support@purebite.com
          </Button>
          <Button asChild>
            <Link href="/contact">
              <MessageCircle className="h-4 w-4 mr-2" />
              লাইভ চ্যাট
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}