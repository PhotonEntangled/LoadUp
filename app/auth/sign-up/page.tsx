"use client";

import AuthForm from '@/app/auth/_components/AuthForm';
import { signUpSchema } from '@/lib/validations'; // Use schema from top-level lib
import { UserRole } from "@/lib/auth"; // Import from auth.ts

export default function SignUpPage() {
  const defaultValues = {
    name: '',
    email: '',
    password: '',
    companyId: '', // Assuming companyId might be needed
    role: 'customer' as const, // Default role
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      <AuthForm
        formType="sign-up"
        schema={signUpSchema}
        defaultValues={defaultValues}
        showRoleSelector={false} // Example: hide role selector for customer sign-up
      />
        {/* Link to Sign In */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/auth/sign-in" className="underline underline-offset-4 hover:text-primary">
          Sign In
        </a>
      </p>
    </div>
  );
} 