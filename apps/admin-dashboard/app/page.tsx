"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [env, setEnv] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Display environment variables for debugging
    setEnv({
      NODE_ENV: process.env.NODE_ENV || 'not set',
      BYPASS_AUTH: process.env.NEXT_PUBLIC_BYPASS_AUTH || 'not set'
    });
    
    // Wait a moment to display debug info
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">LoadUp Root Page</h1>
      <p className="mb-4">Redirecting to dashboard in 2 seconds...</p>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Environment Variables:</h2>
        <pre className="text-xs">{JSON.stringify(env, null, 2)}</pre>
      </div>
      
      <div className="flex flex-col space-y-2">
        <Link 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard Now
        </Link>
        <Link 
          href="/sign-in" 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
} 