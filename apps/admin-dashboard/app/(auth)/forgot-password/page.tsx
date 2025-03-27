"use client";

import AuthForm from '@/components/AuthForm';
import { forgotPasswordSchema } from '@/lib/validations';

export default function ForgotPasswordPage() {
  const defaultValues = {
    email: '',
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        <AuthForm 
          formType="forgot-password" 
          schema={forgotPasswordSchema} 
          defaultValues={defaultValues} 
        />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <a href="/sign-in" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
} 