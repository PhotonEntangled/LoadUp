"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [env, setEnv] = useState<Record<string, string>>({});
  const [cookies, setCookies] = useState<string>('');
  
  useEffect(() => {
    // Display environment variables
    setEnv({
      NODE_ENV: process.env.NODE_ENV || 'not set',
      NEXT_PUBLIC_BYPASS_AUTH: process.env.NEXT_PUBLIC_BYPASS_AUTH || 'not set',
      NEXT_PUBLIC_BETA_MODE: process.env.NEXT_PUBLIC_BETA_MODE || 'not set'
    });
    
    // Get cookies
    setCookies(document.cookie);
    
    // Log debug info to console
    console.log('Debug Page - Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BYPASS_AUTH: process.env.NEXT_PUBLIC_BYPASS_AUTH
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">LoadUp Debug Page</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(env, null, 2)}
          </pre>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {cookies || 'No cookies found'}
          </pre>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Home
          </Link>
          <Link href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Dashboard
          </Link>
          <Link href="/sign-in" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 