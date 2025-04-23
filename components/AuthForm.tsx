"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn, performRedirect } from '@/lib/simple-auth';
// TODO: Re-enable Supabase sign-up when auth is fully implemented
// import { signUpUser } from '@/lib/supabase';
import { UserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_NAMES = {
  email: "Email",
  password: "Password",
  name: "Full Name",
  companyId: "Company ID",
  role: "Role",
};

const FIELD_TYPES = {
  email: "email",
  password: "password",
  name: "text",
  companyId: "text",
  role: "text",
};

interface AuthFormProps<T extends z.ZodType> {
  formType: 'sign-in' | 'sign-up' | 'forgot-password';
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  showRoleSelector?: boolean;
}

export default function AuthForm<T extends z.ZodType>({
  formType,
  schema,
  defaultValues,
  showRoleSelector = false,
}: AuthFormProps<T>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const onSubmit = async (data: z.infer<T>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (formType === 'sign-in') {
        console.log('AuthForm: Attempting to sign in with:', { email: data.email });
        
        // We know these fields exist on the sign-in form
        const result = await signIn({
          email: data.email,
          password: data.password,
        });
        
        console.log('AuthForm: Sign-in result:', result);
        
        if (!result.success) {
          throw new Error(result.error || "Invalid email or password. Please try again.");
        }
        
        // Show success message
        toast({ title: "Sign in successful! Redirecting..." });
        
        // Use the redirectTo from the result if available
        if (result.redirectTo) {
          console.log('AuthForm: Redirecting to:', result.redirectTo);
          // Use the new performRedirect function
          performRedirect(result.redirectTo);
          return;
        }
        
        // Fallback redirection if redirectTo is not available
        console.log('AuthForm: Setting up fallback redirection timer...');
        setTimeout(() => {
          console.log('AuthForm: Fallback timer triggered, checking if redirection needed');
          // Check if we're still on the sign-in page
          if (document.location.pathname.includes('sign-in')) {
            console.log('AuthForm: Manual redirect fallback executing');
            const userType = data.email.includes('admin') ? 'admin' : 
                            data.email.includes('driver') ? 'driver' : 'customer';
            
            const redirectPath = userType === 'admin' ? '/' : 
                                userType === 'driver' ? '/dashboard/driver/success' : 
                                '/dashboard/customer/success';
            
            console.log('AuthForm: Fallback redirecting to:', redirectPath);
            // Use the new performRedirect function
            performRedirect(redirectPath);
          } else {
            console.log('AuthForm: No fallback needed, already redirected');
          }
        }, 1000);
      } else if (formType === 'sign-up') {
        // TODO: Re-enable Supabase sign-up when auth is fully implemented
        console.log('AuthForm: Sign-up logic temporarily disabled for build.');
        toast({ title: "Sign-up Temporarily Disabled", description: "Please contact support.", variant: "destructive" });
        // const { data: signUpData, error: signUpError } = await signUpUser({
        //   email: data.email,
        //   password: data.password,
        //   name: data.name,
        //   companyId: data.companyId,
        //   role: data.role || UserRole.USER,
        // });
        
        // if (signUpError) {
        //   console.error('AuthForm: Sign-up error:', signUpError);
        //   throw new Error(signUpError.message);
        // }
        
        // console.log('AuthForm: Sign-up successful:', signUpData);
        
        // Redirect to success page with user details
        // router.push(`/sign-up/success?email=${encodeURIComponent(data.email)}&role=${data.role || 'customer'}`);
      } else if (formType === 'forgot-password') {
        // Simulate sending a password reset email
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        setEmailSent(true);
        toast({ title: "Password reset link sent to your email" });
      }
    } catch (err) {
      console.error('AuthForm: Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (
    fieldName: string,
    label: string,
    type: string = 'text',
    required: boolean = true
  ) => {
    // Dynamic field access
    const fieldError = errors[fieldName]?.message as string | undefined;
    
    return (
      <div className="mb-4">
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={fieldName}
          type={type}
          className={`w-full px-3 py-2 border rounded-md ${
            fieldError ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading || emailSent}
          // @ts-expect-error - Dynamic field registration
          {...register(fieldName)}
        />
        {fieldError && <p className="mt-1 text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  };

  const renderRoleSelector = () => {
    if (!showRoleSelector) return null;
    
    const fieldError = errors.role?.message as string | undefined;
    
    return (
      <div className="mb-4">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          className={`w-full px-3 py-2 border rounded-md ${
            fieldError ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          // @ts-expect-error - Dynamic field registration
          {...register('role')}
        >
          <option value="customer">Customer</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        {fieldError && <p className="mt-1 text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  };

  // Render success message for forgot password
  if (formType === 'forgot-password' && emailSent) {
    return (
      <div className="w-full">
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
          Password reset link sent! Check your email for instructions.
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/sign-in')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Return to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {formType === 'sign-up' && renderField('name', 'Full Name')}
        {renderField('email', 'Email', 'email')}
        {formType !== 'forgot-password' && renderField('password', 'Password', 'password')}
        {formType === 'sign-up' && renderField('companyId', 'Company ID', 'text', false)}
        {formType === 'sign-up' && showRoleSelector && renderRoleSelector()}
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? "Loading..." 
              : formType === "sign-in" 
                ? "Sign In" 
                : formType === "sign-up" 
                  ? "Sign Up" 
                  : "Reset Password"}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {formType === "sign-in" 
                ? "New to LoadUp?" 
                : formType === "sign-up"
                  ? "Already have an account?"
                  : "Remember your password?"}
            </span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push(
              formType === "sign-in" 
                ? "/sign-up" 
                : formType === "sign-up"
                  ? "/sign-in"
                  : "/sign-in"
            )}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {formType === "sign-in" 
              ? "Create an account" 
              : formType === "sign-up"
                ? "Sign in to your account"
                : "Sign in to your account"}
          </button>
        </div>
      </div>
    </div>
  );
} 