import NextAuth from "next-auth";
import { authOptions } from "./options"; // Import from local options file

const handler = NextAuth(authOptions);

// Export handler AND authOptions
export { handler as GET, handler as POST, authOptions };
