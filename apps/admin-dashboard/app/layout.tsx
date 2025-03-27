import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider as SonnerToastProvider } from "@/components/toast-provider";
import { SentryProvider } from "@/components/sentry-provider";
import { ToastProvider as UIToastProvider } from "@/components/ui/use-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LoadUp Admin Dashboard",
  description: "Admin dashboard for LoadUp logistics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SentryProvider>
          <UIToastProvider>
            {children}
            <SonnerToastProvider />
          </UIToastProvider>
        </SentryProvider>
      </body>
    </html>
  );
} 