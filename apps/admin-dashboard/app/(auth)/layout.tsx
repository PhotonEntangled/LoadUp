import { ReactNode } from "react";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SentryTest } from "@/components/sentry-test";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <Image
              src="/loadup-logo.svg"
              alt="LoadUp Logo"
              height={70}
              width={70}
              className="mb-3 w-auto h-auto"
              priority
            />
            <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-blue-400 rounded-full mb-4"></div>
            <p className="text-center text-gray-600 text-sm font-medium">
              Streamline your logistics operations
            </p>
          </div>
          
          {children}
        </div>
      </div>
      
      {/* Sentry Test Component */}
      <SentryTest />
    </main>
  );
};

export default Layout; 