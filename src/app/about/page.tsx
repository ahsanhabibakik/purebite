import { Heart, Users, Award, Leaf } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          আমাদের সম্পর্কে
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          PureBite হলো স্বাস্থ্যকর ও পুষ্টিকর খাবারের একটি বিশ্বস্ত ব্র্যান্ড। 
          আমরা ১০০% প্রাকৃতিক, হোমমেড এবং অর্গানিক খাবার সরবরাহ করি।
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">আমাদের লক্ষ্য</h2>
          <p className="text-gray-600 leading-relaxed">
            প্রতিটি বাংলাদেশী পরিবারের খাবারের টেবিলে পৌঁছে দেওয়া স্বাস্থ্যকর, 
            পুষ্টিকর এবং নিরাপদ খাবার। আমরা বিশ্বাস করি যে, ভালো খাবার মানেই 
            ভালো স্বাস্থ্য এবং ভালো জীবন।
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">আমাদের দৃষ্টিভঙ্গি</h2>
          <p className="text-gray-600 leading-relaxed">
            একটি স্বাস্থ্যকর বাংলাদেশ গড়ে তোলা, যেখানে প্রতিটি মানুষের কাছে 
            পৌঁছে যাবে মানসম্পন্ন ও পুষ্টিকর খাবার। আমরা চাই প্রাকৃতিক খাবারের 
            মাধ্যমে দেশের মানুষের জীবনযাত্রার মান উন্নয়ন করতে।
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          আমাদের মূল্যবোধ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">প্রাকৃতিক</h3>
            <p className="text-gray-600">
              ১০০% প্রাকৃতিক উপাদান ব্যবহার করে তৈরি
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">স্বাস্থ্যকর</h3>
            <p className="text-gray-600">
              পুষ্টিগুণ ও স্বাস্থ্যের কথা মাথায় রেখে প্রস্তুত
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">বিশ্বস্ত</h3>
            <p className="text-gray-600">
              গ্রাহকদের আস্থা ও বিশ্বাসই আমাদের মূলধন
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">গুণগত মান</h3>
            <p className="text-gray-600">
              প্রতিটি পণ্যে সর্বোচ্চ মানের নিশ্চয়তা
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          আমাদের টিম
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">রহিম উদ্দিন</h3>
            <p className="text-gray-600">প্রতিষ্ঠাতা ও সিইও</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">ফাতেমা খাতুন</h3>
            <p className="text-gray-600">প্রোডাক্ট ডেভেলপমেন্ট হেড</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">করিম আলী</h3>
            <p className="text-gray-600">কোয়ালিটি কন্ট্রোল ম্যানেজার</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-50 rounded-2xl p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">৫০০+</div>
            <div className="text-gray-600">সন্তুষ্ট গ্রাহক</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">৫০+</div>
            <div className="text-gray-600">পণ্যের ধরন</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">৯৮%</div>
            <div className="text-gray-600">গ্রাহক সন্তুষ্টি</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">২৪ঘন্টা</div>
            <div className="text-gray-600">ডেলিভারি সময়</div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          আমাদের সাথে যোগ দিন
        </h2>
        <p className="text-gray-600 mb-6">
          স্বাস্থ্যকর জীবনযাত্রার যাত্রায় আমরা আপনার সাথে আছি
        </p>
      </section>
    </div>
  );
}