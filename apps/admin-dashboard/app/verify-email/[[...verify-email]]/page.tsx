"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // This is a placeholder for the actual verification logic
      // In a real implementation, you would call your API to verify the code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification code to your email. Please enter it below.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 