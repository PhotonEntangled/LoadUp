import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server'; // Keep NextRequest for type hints if needed elsewhere
import NextAuth from 'next-auth';
import { authOptions } from "./options"; // Import from local options file

// Refactored handler function
async function authHandler(req: NextApiRequest, res: NextApiResponse) {
  // You need to pass req.query to the handler
  // @ts-expect-error // TODO: Handle query parameters correctly if needed later
  req.query = { ...req.query, nextauth: req.query.nextauth?.split('/') ?? [] };

  console.log(`[AUTH ROUTE HANDLER] Executing NextAuth for path: ${req.url}`);
  
  try {
    // Execute NextAuth
    await NextAuth(req, res, authOptions);

    // Log response headers after NextAuth has potentially set them
    const headers = res.getHeaders();
    const setCookieHeader = headers['set-cookie'];
    console.log(`[AUTH ROUTE HANDLER] Response Set-Cookie header: ${JSON.stringify(setCookieHeader)}`);

  } catch (error) {
    console.error("[AUTH ROUTE HANDLER] Error during NextAuth execution:", error);
    // Ensure response ends even if error occurs before headers are set
    if (!res.headersSent) {
      res.status(500).json({ error: "Authentication internal error" });
    }
  }
}

// Export the handler for GET and POST requests
export { authHandler as GET, authHandler as POST };

// Keep authOptions export if needed elsewhere
export { authOptions };
