import { z } from "zod";
import { UserRole } from "@/lib/auth";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyId: z.string().optional(),
  role: z.enum(["admin", "driver", "customer"] as const).default("customer"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
}); 