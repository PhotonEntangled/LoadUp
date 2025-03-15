import { ReactNode } from "react";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-col-reverse sm:flex-row min-h-screen">
      <section className="flex-1 flex items-center bg-gradient-to-br from-blue-900 to-blue-700 px-5 py-10 min-h-screen">
        <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-lg bg-white/10 backdrop-blur-sm p-10">
          <div className="flex flex-row gap-3">
            <Image src="/logo.svg" alt="logo" width={37} height={37} />
            <h1 className="text-2xl font-semibold text-white">LoadUp</h1>
          </div>

          <div>{children}</div>
        </div>
      </section>

      <section className="h-40 w-full sm:h-screen sm:flex-1 sticky sm:top-0">
        <Image
          src="/images/logistics-illustration.jpg"
          alt="logistics illustration"
          height={1000}
          width={1000}
          className="w-full h-full object-cover"
        />
      </section>
    </main>
  );
};

export default Layout; 