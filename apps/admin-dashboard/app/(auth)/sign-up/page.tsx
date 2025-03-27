"use client";

import AuthForm from '@/components/AuthForm';
import { signUpSchema } from '@/lib/validations';
import { UserRole } from '@/auth';

export default function SignUpPage() {
  const defaultValues = {
    name: '',
    email: '',
    password: '',
    companyId: '',
    role: 'customer' as const,
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
        showRoleSelector={false} 
      />
    </div>
  );
} 