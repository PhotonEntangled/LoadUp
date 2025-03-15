import { ReactNode } from "react";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession();

  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen">
      <section className="flex w-full items-center justify-center bg-white p-8 md:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-row items-center gap-3">
            <div className="text-3xl font-bold text-blue-600">📦</div>
            <h1 className="text-2xl font-semibold text-gray-900">LoadUp</h1>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">{children}</div>
        </div>
      </section>

      <section className="hidden bg-blue-600 md:block md:w-1/2">
        <div className="flex h-full items-center justify-center p-8">
          <div className="max-w-lg text-center text-white">
            <h2 className="mb-6 text-3xl font-bold">Streamline Your Logistics Operations</h2>
            <p className="text-lg">
              Manage shipments, track deliveries, and optimize your logistics workflow with LoadUp's powerful dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout; 