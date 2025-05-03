'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { logger } from '@/utils/logger'; // Assuming client-side logger setup

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);
    logger.info(`[SignInPage] Attempting sign in for: ${email}`);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        email,
        password,
      });

      logger.info(`[SignInPage] signIn result: ${JSON.stringify(result)}`);

      if (result?.error) {
        logger.error(`[SignInPage] signIn error: ${result.error}`);
        if (result.error === 'CredentialsSignin') {
          setError('Sign in failed. Check the details you provided are correct.');
        } else {
           // Attempt to provide a more specific error if available from the URL error param NextAuth might add
           const urlError = new URLSearchParams(window.location.search).get('error');
           setError(`Sign in failed: ${urlError || result.error}`);
        }
        setIsLoading(false);
      } else if (result?.ok) {
        logger.info(`[SignInPage] signIn successful, redirecting to dashboard.`);
        router.push('/'); // Redirect to root/dashboard
      } else {
         logger.warn(`[SignInPage] signIn returned ok:false without an error message.`);
         setError('An unexpected error occurred during sign in.');
         setIsLoading(false);
      }
    } catch (catchError: any) {
      logger.error(`[SignInPage] Exception during signIn call: ${catchError.message}`, { stack: catchError.stack });
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Access your LoadUp dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900 border-red-700 text-red-100">
                {/* Optional: Add icon <AlertCircle className="h-4 w-4" /> */}
                <AlertTitle>Sign In Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
             <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign in with Credentials'}
            </Button>
          </form>
        </CardContent>
        {/* Footer can be added later if needed */}
        {/* <CardFooter className="text-center text-sm text-gray-400"> ... </CardFooter> */}
      </Card>
    </div>
  );
} 