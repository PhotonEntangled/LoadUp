"use client";

import { useState, useEffect } from "react";
import AuthForm from '@/app/auth/_components/AuthForm';
import { signInSchema } from '@/lib/validations';
import Image from "next/image";
import { signIn, performRedirect } from '@/lib/simple-auth';

export default function SignInPage() {
  const [userType, setUserType] = useState<'customer' | 'driver' | 'admin'>('customer');

  useEffect(() => {
    console.log('SignInPage: Mounted with userType:', userType);
  }, []);

  const defaultValues = {
    email: userType === 'admin' ? 'admin@loadup.com' :
           userType === 'driver' ? 'driver@loadup.com' : '',
    password: userType === 'admin' ? 'admin123' :
              userType === 'driver' ? 'driver123' : '',
  };

  const handleUserTypeChange = (type: 'customer' | 'driver' | 'admin') => {
    console.log('SignInPage: User type changed to:', type);
    setUserType(type);
  };

  const handleDirectLogin = async (type: 'admin' | 'driver') => {
    const credentials = {
      email: type === 'admin' ? 'admin@loadup.com' : 'driver@loadup.com',
      password: type === 'admin' ? 'admin123' : 'driver123',
    };
    try {
      const result = await signIn(credentials);
      if (!result.success) {
        return;
      }
      if (result.redirectTo) {
        performRedirect(result.redirectTo);
        return;
      }
      setTimeout(() => {
        if (document.location.pathname.includes('sign-in')) {
          const redirectPath = type === 'admin' ? '/dashboard' : '/dashboard/driver/success';
          performRedirect(redirectPath);
        }
      }, 1000);
    } catch (error) {
      console.error('SignInPage: Direct login error:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <Image
          src="/loadup-logo.svg"
          alt="LoadUp Logo"
          width={120}
          height={40}
          priority
          className="h-auto w-auto max-h-12"
        />
      </div>
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in to your account
        </p>
      </div>
      <div className="mb-6">
        <div className="flex justify-center space-x-2 mb-4">
          {/* User Type Buttons */}
          <button
            type="button"
            onClick={() => handleUserTypeChange('customer')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              userType === 'customer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange('driver')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              userType === 'driver'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Driver
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange('admin')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              userType === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
        </div>
        {userType === 'driver' && (
          <div className="bg-green-50 p-3 rounded-md text-sm text-green-800 mb-4">
            <p className="font-medium">Driver Login</p>
            <p>Use driver@loadup.com / driver123 for testing</p>
          </div>
        )}
        {userType === 'admin' && (
          <div className="bg-purple-50 p-3 rounded-md text-sm text-purple-800 mb-4">
            <p className="font-medium">Admin Login</p>
            <p>Use admin@loadup.com / admin123 for testing</p>
          </div>
        )}
        {/* Direct Login Buttons */}
        <div className="mt-4 flex justify-center space-x-2">
          <button
            type="button"
            onClick={() => handleDirectLogin('admin')}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Test Admin Login
          </button>
          <button
            type="button"
            onClick={() => handleDirectLogin('driver')}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Test Driver Login
          </button>
        </div>
        {/* Direct Links */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Direct links for testing:</p>
          <div className="flex justify-center space-x-4">
            <a
              href="/"
              className="text-sm text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Admin Dashboard
            </a>
            {/* ... other links ... */}
             <a href="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
                Forgot Password?
              </a>
          </div>
        </div>
      </div>
      <AuthForm
        formType="sign-in"
        schema={signInSchema}
        defaultValues={defaultValues}
      />
       {/* Link to Sign Up */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a href="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
          Sign Up
        </a>
      </p>
    </div>
  );
} 