import { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import { signInSchema } from '@/lib/validations';

export const metadata: Metadata = {
  title: 'Sign In - LoadUp Admin',
  description: 'Sign in to your LoadUp Admin Dashboard account',
};

export default function SignInPage() {
  const defaultValues = {
    email: '',
    password: '',
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        <AuthForm 
          formType="sign-in" 
          schema={signInSchema} 
          defaultValues={defaultValues} 
        />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/sign-up" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
} 