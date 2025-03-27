"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SignUpSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get user details from URL params (if available)
  const email = searchParams.get('email') || 'your email';
  const role = searchParams.get('role') || 'customer';
  
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-6 flex items-center justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <h1 className="text-2xl font-semibold tracking-tight mb-2">
        Sign Up Successful!
      </h1>
      
      <p className="text-gray-600 mb-4">
        Your account has been created successfully. You can now sign in with your credentials.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 w-full text-left">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Email:</span> {email}
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <span className="font-semibold">Role:</span> {role}
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <span className="font-semibold">Status:</span> Account created (simulated)
        </p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6 w-full text-left">
        <p className="text-sm text-yellow-700">
          <span className="font-semibold">Note:</span> This is a simulated sign-up. In a production environment, 
          your account would be stored in a database and you would receive a confirmation email.
        </p>
      </div>
      
      <button
        onClick={() => router.push('/sign-in')}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go to Sign In
      </button>
    </div>
  );
} 