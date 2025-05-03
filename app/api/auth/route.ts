// import { getServerSession } from "next-auth/next" // Commented out
import { NextResponse } from "next/server"
// If you have auth options defined elsewhere (e.g., in lib/auth), import them
// import { authOptions } from "@/lib/auth"; 

export async function GET(request: Request) {
  // const session = await getServerSession(authOptions) // Commented out

  console.log("[api/auth] GET request - Auth check temporarily bypassed.");

  // Basic response indicating the endpoint exists, but auth is bypassed
  return NextResponse.json({ message: "Auth endpoint reached (currently bypassed)." });

  /* // Original logic
  if (!session) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: !!session,
    session,
  });
  */
} 