"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
// Use updated alias paths
import { signIn, performRedirect } from '@/lib/simple-auth';
// import { signUpUser } from '@/lib/supabase'; // Needs verification
import { UserRole } from "@/lib/auth"; // Import from auth.ts
import { useToast } from "@/hooks/use-toast"; // Updated import
import Link from "next/link";

// TODO: Define actual schemas or import them correctly
// interface AuthFormProps<T extends z.ZodType> {
// Use a generic type for now until schemas are sorted
interface AuthFormProps {
  formType: 'sign-in' | 'sign-up' | 'forgot-password';
  schema: any; // Placeholder for actual schema type
  defaultValues?: Record<string, any>; // Placeholder
  showRoleSelector?: boolean;
}

// Placeholder for missing signUpUser function - needs implementation
const signUpUser = async (data: any) => {
  console.warn("signUpUser function not implemented! Needs Supabase integration?");
  return { data: null, error: new Error("Sign up not implemented") };
}

export default function AuthForm({
  formType,
  schema,
  defaultValues,
  showRoleSelector = false,
}: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast(); // Added hook call

  const {
    register,
    handleSubmit,
    formState: { errors },
    // Use reset for default values if needed
    // reset,
  } = useForm<any>({
    // resolver: zodResolver(schema), // Comment out until schema type is fixed
    defaultValues: defaultValues,
  });

  // useEffect(() => {
  //   if (defaultValues) {
  //     reset(defaultValues);
  //   }
  // }, [defaultValues, reset]);

  const onSubmit = async (data: any) => { // Use any for data until schema type fixed
    setIsLoading(true);
    setError(null);

    try {
      if (formType === 'sign-in') {
        console.log('AuthForm: Attempting to sign in with:', { email: data.email });
        const result = await signIn({
          email: data.email,
          password: data.password,
        });
        console.log('AuthForm: Sign-in result:', result);
        if (!result.success) {
          throw new Error(result.error || "Invalid email or password. Please try again.");
        }
        toast({ title: "Sign in successful! Redirecting..." }); // Updated toast call
        if (result.redirectTo) {
          console.log('AuthForm: Redirecting to:', result.redirectTo);
          performRedirect(result.redirectTo);
          return;
        }
        console.log('AuthForm: Setting up fallback redirection timer...');
        setTimeout(() => {
          console.log('AuthForm: Fallback timer triggered, checking if redirection needed');
          if (document.location.pathname.includes('sign-in')) {
            console.log('AuthForm: Manual redirect fallback executing');
            const userType = data.email.includes('admin') ? 'admin' :
                            data.email.includes('driver') ? 'driver' : 'customer';
            const redirectPath = userType === 'admin' ? '/' :
                                userType === 'driver' ? '/dashboard/driver/success' :
                                '/dashboard/customer/success';
            console.log('AuthForm: Fallback redirecting to:', redirectPath);
            performRedirect(redirectPath);
          } else {
            console.log('AuthForm: No fallback needed, already redirected');
          }
        }, 1000);
      } else if (formType === 'sign-up') {
        console.log('AuthForm: Attempting to sign up with:', { email: data.email });
        const { data: signUpData, error: signUpError } = await signUpUser({
          email: data.email,
          password: data.password,
          name: data.name,
          companyId: data.companyId,
          role: data.role || UserRole.USER,
        });
        if (signUpError) {
          console.error('AuthForm: Sign-up error:', signUpError);
          throw new Error(signUpError.message);
        }
        console.log('AuthForm: Sign-up successful:', signUpData);
        toast({ title: "Sign up successful! Please sign in." }); // Updated toast call
        router.push('/auth/sign-in'); // Redirect to sign-in after successful sign-up
      } else if (formType === 'forgot-password') {
        // Simulate sending a password reset email
        console.log('AuthForm: Simulating forgot password for:', data.email);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEmailSent(true);
        toast({ title: "Password reset link sent to your email" }); // Updated toast call
      }
    } catch (err) {
      console.error('AuthForm: Authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({ variant: "destructive", title: "Authentication Error", description: errorMessage }); // Updated toast call
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get field properties - avoids repeated @ts-ignore
  const getFieldProps = (fieldName: string) => {
    // @ts-ignore
    const fieldError = errors[fieldName]?.message as string | undefined;
    const fieldLabel = (fieldName.charAt(0).toUpperCase() + fieldName.slice(1)).replace(/([A-Z])/g, ' $1').trim(); // Simple label generation
    const fieldType = fieldName === 'email' ? 'email' : fieldName === 'password' ? 'password' : 'text';
    return { fieldError, fieldLabel, fieldType };
  };

  const renderField = (
    fieldName: string,
    required: boolean = true
  ) => {
    const { fieldError, fieldLabel, fieldType } = getFieldProps(fieldName);
    return (
      <div className="mb-4">
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
          {fieldLabel} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={fieldName}
          type={fieldType}
          className={`w-full px-3 py-2 border rounded-md ${
            fieldError ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading || (formType === 'forgot-password' && emailSent)}
          {...register(fieldName)}
        />
        {fieldError && <p className="mt-1 text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  };

  const renderRoleSelector = () => {
    if (!showRoleSelector) return null;
    const { fieldError } = getFieldProps('role');
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
          {...register('role')}
        >
          <option value={UserRole.USER}>Customer</option>
          <option value={UserRole.DRIVER}>Driver</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </select>
        {fieldError && <p className="mt-1 text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  };

  if (formType === 'forgot-password' && emailSent) {
    return (
      <div className="w-full">
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
          Password reset link sent! Check your email for instructions.
        </div>
        <div className="text-center">
          <Link href="/auth/sign-in" className="text-sm text-blue-600 hover:text-blue-500">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {formType === 'sign-up' && renderField('name')}
        {renderField('email')}
        {formType !== 'forgot-password' && renderField('password')}
        {formType === 'sign-up' && renderField('companyId', false)} {/* Assuming companyId is optional */}
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
          <Link 
             href={formType === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}
             className="text-sm text-blue-600 hover:text-blue-500"
           >
             {formType === "sign-in"
              ? "Create an account"
              : formType === "sign-up"
                ? "Sign in to your account"
                : "Sign in to your account"}
           </Link>
        </div>
      </div>
    </div>
  );
} 