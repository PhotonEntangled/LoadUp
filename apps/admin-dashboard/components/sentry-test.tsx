"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export function SentryTest() {
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestSentry = () => {
    try {
      // Trigger a test error
      throw new Error("This is a test error for Sentry");
    } catch (error) {
      if (error instanceof Error) {
        // Capture the error with Sentry
        Sentry.captureException(error);
        
        // Show success message
        setTestResult("Error sent to Sentry successfully!");
        
        // Reset message after 3 seconds
        setTimeout(() => {
          setTestResult(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleTestSentry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition-colors"
      >
        Test Sentry
      </button>
      
      {testResult && (
        <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md text-sm">
          {testResult}
        </div>
      )}
    </div>
  );
} 