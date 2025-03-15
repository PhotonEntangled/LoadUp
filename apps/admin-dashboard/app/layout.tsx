import { Inter } from 'next/font/google';
import './globals.css';
import { getServerSession } from "next-auth";
import { ClientLayout } from './client-layout';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the session from the server
  const session = await getServerSession();
  
  // Log session status for debugging
  console.log("Server session status:", { hasSession: !!session });
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout session={session}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
} 