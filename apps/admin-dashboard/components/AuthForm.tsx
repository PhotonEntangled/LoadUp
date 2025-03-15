"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from '@/lib/auth';
import { signUpUser } from '@/lib/supabase';
import { UserRole } from "@/lib/auth.config";
import { toast } from "sonner";
import Link from "next/link";

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
  formType: 'sign-in' | 'sign-up';
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
        // @ts-ignore - We know these fields exist on the sign-in form
        await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: true,
          callbackUrl: '/dashboard',
        });
        
        // If we get here, sign-in was successful (otherwise it would redirect)
        router.push('/dashboard');
      } else {
        // @ts-ignore - We know these fields exist on the sign-up form
        const { error } = await signUpUser({
          email: data.email,
          password: data.password,
          name: data.name,
          companyId: data.companyId,
          role: data.role,
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Redirect to sign-in after successful sign-up
        router.push('/sign-in?registered=true');
      }
    } catch (err) {
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
    // @ts-ignore - Dynamic field access
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
          disabled={isLoading}
          // @ts-ignore - Dynamic field registration
          {...register(fieldName)}
        />
        {fieldError && <p className="mt-1 text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  };

  const renderRoleSelector = () => {
    if (!showRoleSelector) return null;
    
    // @ts-ignore - Dynamic field access
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
          // @ts-ignore - Dynamic field registration
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

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {formType === 'sign-up' && renderField('name', 'Full Name')}
          {renderField('email', 'Email', 'email')}
          {renderField('password', 'Password', 'password')}
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
              {isLoading ? "Loading..." : formType === "sign-in" ? "Sign In" : "Sign Up"}
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
                  : "Already have an account?"}
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push(formType === "sign-in" ? "/sign-up" : "/sign-in")}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {formType === "sign-in" 
                ? "Create an account" 
                : "Sign in to your account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 