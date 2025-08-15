import { Metadata } from "next";
import { FAQClient } from "./faq-client";

export const metadata: Metadata = {
  title: "সাধারণত জিজ্ঞাসিত প্রশ্নাবলী - PureBite",
  description: "PureBite সম্পর্কে সাধারণত জিজ্ঞাসিত প্রশ্ন ও উত্তর। অর্ডার, ডেলিভারি, পেমেন্ট এবং পণ্যের মান সম্পর্কে জানুন।",
};

export default function FAQPage() {
  return <FAQClient />;
}