import { getServerSession } from "next-auth";
import { Providers } from "./providers";

// This is a server component that fetches the session
export async function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the session from the server
  const session = await getServerSession();
  
  // Log session status for debugging
  console.log("Server session status:", { hasSession: !!session });
  
  // Pass the session to the client-side Providers component
  return <Providers session={session}>{children}</Providers>;
} 