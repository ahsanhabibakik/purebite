import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          যোগাযোগ করুন
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          আমাদের সাথে যোগাযোগ করুন। আমরা সর্বদা আপনার সেবায় নিয়োজিত।
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            আমাদের লিখুন
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="আপনার পূর্ণ নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ফোন নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="০১৭১১১২৩৪৫৬"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল ঠিকানা *
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                বিষয় *
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">বিষয় নির্বাচন করুন</option>
                <option value="product">পণ্য সম্পর্কে জানতে</option>
                <option value="order">অর্ডার সম্পর্কে</option>
                <option value="delivery">ডেলিভারি সম্পর্কে</option>
                <option value="complaint">অভিযোগ</option>
                <option value="suggestion">পরামর্শ</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                আপনার বার্তা *
              </label>
              <textarea
                required
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="আপনার বার্তা এখানে লিখুন..."
              />
            </div>
            
            <Button type="submit" className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              বার্তা পাঠান
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            যোগাযোগের তথ্য
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">ঠিকানা</h3>
                <p className="text-gray-600">
                  ১২৩, পুরানা পল্টন<br />
                  ঢাকা - ১০০০, বাংলাদেশ
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">ফোন</h3>
                <p className="text-gray-600">
                  হটলাইন: +880 1711-123456<br />
                  অফিস: +880 2-9876543
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">ইমেইল</h3>
                <p className="text-gray-600">
                  info@purebite.com<br />
                  support@purebite.com
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">কর্মঘণ্টা</h3>
                <p className="text-gray-600">
                  সকাল ৯:০০ - রাত ৯:০০<br />
                  (সপ্তাহের সব দিন)
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              সচরাচর জিজ্ঞাসিত প্রশ্ন
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">ডেলিভারি কত সময় লাগে?</h4>
                <p className="text-sm text-gray-600">ঢাকার ভিতরে ২৪ ঘন্টা, ঢাকার বাইরে ২-৩ দিন।</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">পেমেন্ট পদ্ধতি কী কী?</h4>
                <p className="text-sm text-gray-600">ক্যাশ অন ডেলিভারি, মোবাইল ব্যাংকিং, ব্যাংক ট্রান্সফার।</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">রিটার্ন পলিসি কী?</h4>
                <p className="text-sm text-gray-600">পণ্যে সমস্যা থাকলে ২৪ ঘন্টার মধ্যে রিটার্ন করতে পারবেন।</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          আমাদের অবস্থান
        </h2>
        <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
          <p className="text-gray-600">Google Map যুক্ত করা হবে</p>
        </div>
      </section>
    </div>
  );
}