import "next-auth";
import type { UserRole } from "@/lib/auth"; // Adjust import path if needed

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

// <<< ADDED JWT DECLARATION >>>
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    /** User ID */
    id: string;
    /** User role */
    role: UserRole;
    // Add other token properties if needed, e.g.:
    // email?: string;
    // name?: string;
    // picture?: string;
  }
}
// <<< END ADDED JWT DECLARATION >>> 