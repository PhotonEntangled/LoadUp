import { DefaultSession } from "next-auth";
import { USER_ROLE_ENUM } from "@/database/schema";

declare module "next-auth" {
  interface Session {
    user: {
      role: typeof USER_ROLE_ENUM.enumValues[number];
    } & DefaultSession["user"];
  }

  interface User {
    role: typeof USER_ROLE_ENUM.enumValues[number];
  }
} 