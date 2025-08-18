import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "সাইন আপ - PureBite",
  description: "PureBite এ নতুন অ্যাকাউন্ট তৈরি করুন।",
};

export default async function SignUpPage() {
  const session = await getServerSession(authConfig);
  
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          নতুন অ্যাকাউন্ট তৈরি করুন
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          অথবা{" "}
          <a href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
            আপনার অ্যাকাউন্টে সাইন ইন করুন
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}