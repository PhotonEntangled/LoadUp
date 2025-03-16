'use client';

// @ts-ignore - Type declarations are available from the installed package
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
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-center">
              <svg
                className="h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-center text-xl font-semibold text-gray-800">
              Critical Error
            </h2>
            <p className="mb-4 text-center text-gray-600">
              A critical error has occurred. Our team has been notified.
            </p>
            <div className="flex justify-center">
              <button
                onClick={reset}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded-md bg-gray-100 p-3">
                <p className="text-sm font-medium text-gray-800">Error details:</p>
                <p className="text-xs text-gray-600">{error.message}</p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
} 