import { Metadata } from "next";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড - PureBite",
  description: "PureBite অর্গানিক খাবার ব্যবসার অ্যাডমিন ড্যাশবোর্ড। অর্ডার, গ্রাহক এবং বিক্রয় পরিচালনা করুন।",
};

export default function AdminPage() {
  return <AdminClient />;
}