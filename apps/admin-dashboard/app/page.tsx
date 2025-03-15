"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard or sign-in based on authentication status
    const isAuthenticated = process.env.NEXT_PUBLIC_BETA_MODE === 'true';
    
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/sign-in');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">LoadUp</h1>
        <p className="text-xl text-gray-600 mb-8">Modern Logistics Platform</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
} 