import { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import { signUpSchema } from '@/lib/validations';
import { UserRole } from '@/lib/auth.config';

export const metadata: Metadata = {
  title: 'Sign Up - LoadUp Admin',
  description: 'Create a new account for LoadUp Admin Dashboard',
};

export default function SignUpPage() {
  const defaultValues = {
    name: '',
    email: '',
    password: '',
    companyId: '',
    role: 'customer' as UserRole,
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <AuthForm 
          formType="sign-up" 
          schema={signUpSchema} 
          defaultValues={defaultValues} 
          showRoleSelector={true} 
        />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/sign-in" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
} 