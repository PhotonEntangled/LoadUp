'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-red-100 p-2 text-center">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
            </div>
            <h2 className="mb-2 text-center text-xl font-semibold text-gray-800">
              Application Error
            </h2>
            <p className="mb-4 text-center text-gray-600">
              A critical error has occurred. Please try refreshing the page.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => reset()}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded-md bg-gray-100 p-3">
                <p className="text-sm font-medium text-gray-800">Error details:</p>
                <p className="text-xs text-gray-600">{error.message}</p>
                <div className="mt-2 max-h-40 overflow-auto">
                  <pre className="text-xs text-gray-500">{error.stack}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
} 