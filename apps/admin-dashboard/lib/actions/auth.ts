"use server";

import { signIn } from "../../auth";
import { createUser, getUserByEmail } from "../db-auth";

export const signInWithCredentials = async (
  params: { email: string; password: string }
) => {
  const { email, password } = params;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("Signin error:", error);
    return { success: false, error: "Authentication failed. Please try again." };
  }
};

export const signUp = async (params: { 
  fullName: string; 
  email: string; 
  password: string; 
  role?: string;
}) => {
  const { fullName, email, password, role = "CUSTOMER" } = params;

  try {
    // Create new user using our db-auth module
    const user = await createUser({
      fullName,
      email,
      password,
      role,
    });

    if (!user) {
      return { success: false, error: "User already exists or could not be created" };
    }

    // Sign in the user
    const signInResult = await signInWithCredentials({ email, password });
    
    if (!signInResult.success) {
      return { success: false, error: "Account created but failed to sign in. Please try signing in manually." };
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}; 