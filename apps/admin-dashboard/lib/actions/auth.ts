"use server";

import { signIn } from "@/lib/auth";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { signUpUser } from "@/lib/supabase";
import { AuthError } from "next-auth";
import { z } from "zod";

export async function signInWithCredentials(formData: z.infer<typeof signInSchema>) {
  try {
    const validatedFields = signInSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      return { 
        success: false,
        error: "Invalid fields. Please check your inputs." 
      };
    }
    
    // NextAuth will use our configured Supabase provider
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { 
        success: false,
        error: "Authentication failed. Invalid credentials." 
      };
    }
    
    return { 
      success: false,
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function signUp(formData: z.infer<typeof signUpSchema>) {
  try {
    const validatedFields = signUpSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      return { 
        success: false,
        error: "Invalid fields. Please check your inputs." 
      };
    }

    // Create user in Supabase
    const { data, error } = await signUpUser({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      name: validatedFields.data.name,
      companyId: validatedFields.data.companyId,
    });

    if (error) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        error: error.message || "Failed to create account" 
      };
    }

    // After creating the user, sign in automatically
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { 
      success: false,
      error: "Failed to create account. Please try again." 
    };
  }
} 