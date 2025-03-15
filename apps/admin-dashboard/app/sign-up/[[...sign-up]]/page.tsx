import { useSession, signIn, signOut } from "next-auth/react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-[480px] p-4",
            card: "shadow-xl rounded-xl border border-gray-100",
          },
        }}
      />
    </div>
  );
} 