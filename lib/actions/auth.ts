"use server";

import { signIn } from "@/lib/auth";
import { signInSchema, signUpSchema } from "@/lib/validations";
// TODO: Re-enable when Supabase integration is complete
// import { signUpUser } from "@/lib/supabase";
import { AuthError } from '@auth/core/errors';
import { z } from "zod";

export async function signInWithCredentials(formData: z.infer<typeof signInSchema>) {
  const validatedFields = signInSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields." };
  }

  const { email, password } = validatedFields.data;

  try {
    console.log(`Attempting sign in for: ${email}`);
    // With redirect: false, signIn throws AuthError on failure, returns undefined/null on success.
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log(`Sign in successful for: ${email}`);
    return { success: true };

  } catch (error) {
    // Check if it's an AuthError *before* accessing type/message
    if (error instanceof AuthError) {
      console.error(`AuthError during sign in for ${email}:`, error.type, error.message);
      // Map specific error types if needed
      switch (error.type) {
        case 'CredentialsSignin':
        case 'CallbackRouteError': // Might include db errors during authorize
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    } 
    // Handle other unknown errors
    console.error('Unexpected error during signInWithCredentials:', error);
    // Instead of rethrowing, return a generic error for the client
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function signUp(formData: z.infer<typeof signUpSchema>) {
  const validatedFields = signUpSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields." };
  }

  const { email, password, name, companyId } = validatedFields.data;

  try {
    // 1. Create user in Supabase (or your DB)
    console.log(`Attempting sign up for: ${email} - TEMPORARILY DISABLED`);
    // TODO: Re-enable when Supabase integration is complete
    // const { error: signUpDbError } = await signUpUser({
    //   email,
    //   password, // signUpUser should handle hashing
    //   name,
    //   companyId,
    // });

    // if (signUpDbError) {
    //   console.error(`Supabase signup error for ${email}:`, signUpDbError.message);
    //   return { success: false, error: signUpDbError.message || "Failed to create account." };
    // }
    // console.log(`Supabase user created for: ${email}`);

    // --- TEMPORARY: Return error until implemented --- 
    return { success: false, error: "Sign-up functionality is temporarily disabled." };
    // --- END TEMPORARY ---

    // 2. Automatically sign in the new user (Keep commented out until step 1 is active)
    // console.log(`Automatic sign in successful for new user: ${email}`);
    // await signIn("credentials", {
    //   email,
    //   password, // Use the original password
    //   redirect: false,
    // });
    // return { success: true };

  } catch (error) {
    // Check if it's an AuthError *before* accessing type/message
    if (error instanceof AuthError) {
       console.error(`AuthError during auto sign in for ${email}:`, error.type, error.message);
      // Even if DB user created, sign-in failed
      return { success: false, error: "Account created, but auto sign-in failed." };
    }
    // Handle other unknown errors
    console.error(`Unexpected error during signUp for ${email}:`, error);
    return { success: false, error: "Failed to complete sign up process." };
  }
} 