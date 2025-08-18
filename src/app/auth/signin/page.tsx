import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "সাইন ইন - PureBite",
  description: "আপনার PureBite অ্যাকাউন্টে সাইন ইন করুন।",
};

export default async function SignInPage() {
  const session = await getServerSession(authConfig);
  
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          আপনার অ্যাকাউন্টে সাইন ইন করুন
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          অথবা{" "}
          <a href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}