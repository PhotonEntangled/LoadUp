'use client';

// @ts-ignore - Type declarations are available from the installed package
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/shared/Card';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container mx-auto py-12">
      <Card className="p-6 max-w-lg mx-auto">
        <div className="text-center py-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-6">
            {process.env.NODE_ENV === 'development' ? (
              <>
                <div className="p-4 bg-red-50 rounded text-red-800 text-left mb-4">
                  <strong>Error:</strong> {error.message}
                </div>
                <div className="text-xs text-left mb-4 p-2 bg-gray-100 rounded overflow-auto">
                  <pre>{error.stack}</pre>
                </div>
              </>
            ) : (
              'An error occurred. Our team has been notified.'
            )}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => reset()}>Try again</Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 