"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  phone: z.string().min(11, "সঠিক মোবাইল নম্বর দিন"),
  subject: z.string().min(5, "বিষয় কমপক্ষে ৫ অক্ষরের হতে হবে"),
  message: z.string().min(10, "বার্তা কমপক্ষে ১০ অক্ষরের হতে হবে"),
  inquiryType: z.enum(["general", "order", "complaint", "suggestion", "partnership"])
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: "general"
    }
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Contact form submitted:', data);
      setSubmitSuccess(true);
      form.reset();
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "ফোন",
      details: ["০১৭০০০০০০০০", "০১৮০০০০০০০০"],
      description: "সকাল ৯টা থেকে রাত ৯টা"
    },
    {
      icon: Mail,
      title: "ইমেইল",
      details: ["info@purebite.com", "support@purebite.com"],
      description: "২৪ ঘন্টার মধ্যে উত্তর"
    },
    {
      icon: MapPin,
      title: "ঠিকানা",
      details: ["১২৩, গ্রীন রোড, ধানমন্ডি", "ঢাকা-১২০৫, বাংলাদেশ"],
      description: "অফিস ভিজিট করুন"
    },
    {
      icon: Clock,
      title: "কার্যসময়",
      details: ["সোম-শুক্র: ৯:০০ - ১৮:০০", "শনি: ৯:০০ - ১৪:০০"],
      description: "রবিবার বন্ধ"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "সাধারণ জিজ্ঞাসা" },
    { value: "order", label: "অর্ডার সংক্রান্ত" },
    { value: "complaint", label: "অভিযোগ" },
    { value: "suggestion", label: "পরামর্শ" },
    { value: "partnership", label: "ব্যবসায়িক অংশীদারিত্ব" }
  ];

  const faqItems = [
    {
      question: "আমার অর্ডার কতদিনে পৌঁছাবে?",
      answer: "ঢাকার ভিতরে ২৪ ঘন্টা এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে পৌঁছায়।"
    },
    {
      question: "পেমেন্ট কীভাবে করব?",
      answer: "আমরা ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট এবং অনলাইন কার্ড পেমেন্ট গ্রহণ করি।"
    },
    {
      question: "পণ্য ফেরত দেওয়া যাবে?",
      answer: "পণ্য পাওয়ার ২৪ ঘন্টার মধ্যে কোন সমস্যা থাকলে আমাদের জানান। আমরা ফেরত বা বদল করে দিব।"
    },
    {
      question: "ডেলিভারি চার্জ কত?",
      answer: "ঢাকার ভিতরে ৬০ টাকা, বাইরে ১০০ টাকা। ৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি।"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              আমাদের সাথে যোগাযোগ করুন
            </h1>
            <p className="text-xl text-green-100 mb-8">
              আপনার যেকোনো প্রশ্ন, মতামত বা সাহায্যের জন্য আমরা এখানে আছি। 
              আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না।
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">যোগাযোগের তথ্য</h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-gray-600">{detail}</p>
                        ))}
                        <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-4">দ্রুত সহায়তা</h3>
                
                <a 
                  href="tel:01700000000"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Phone className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">এখনই ফোন করুন</span>
                </a>
                
                <a 
                  href="mailto:info@purebite.com"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">ইমেইল পাঠান</span>
                </a>
                
                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-700 font-medium">লাইভ চ্যাট শুরু করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                আমাদের বার্তা পাঠান
              </h2>

              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    বার্তা পাঠানো হয়েছে!
                  </h3>
                  <p className="text-green-700 mb-4">
                    আপনার বার্তা আমাদের কাছে পৌঁছেছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                  </p>
                  <Button onClick={() => setSubmitSuccess(false)} variant="outline">
                    নতুন বার্তা পাঠান
                  </Button>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <Label htmlFor="inquiryType">জিজ্ঞাসার ধরন</Label>
                    <select
                      {...form.register("inquiryType")}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name">নাম *</Label>
                      <Input
                        {...form.register("name")}
                        placeholder="আপনার পূর্ণ নাম"
                        className="mt-1"
                      />
                      {form.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                      <Input
                        {...form.register("phone")}
                        placeholder="০১৭XXXXXXXX"
                        className="mt-1"
                      />
                      {form.formState.errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">ইমেইল *</Label>
                    <Input
                      {...form.register("email")}
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">বিষয় *</Label>
                    <Input
                      {...form.register("subject")}
                      placeholder="আপনার জিজ্ঞাসার বিষয়"
                      className="mt-1"
                    />
                    {form.formState.errors.subject && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">বার্তা *</Label>
                    <Textarea
                      {...form.register("message")}
                      placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                      rows={5}
                      className="mt-1"
                    />
                    {form.formState.errors.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        বার্তা পাঠান
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            প্রায়শই জিজ্ঞাসিত প্রশ্ন
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Headphones className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-900">
              গ্রাহক সেবা সময়সূচি
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-blue-800">
            <div>
              <div className="font-semibold">ফোন সাপোর্ট</div>
              <div className="text-sm">সকাল ৯টা - রাত ৯টা</div>
            </div>
            <div>
              <div className="font-semibold">ইমেইল সাপোর্ট</div>
              <div className="text-sm">২৪/৭ উপলব্ধ</div>
            </div>
            <div>
              <div className="font-semibold">লাইভ চ্যাট</div>
              <div className="text-sm">সকাল ১০টা - রাত ৮টা</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}