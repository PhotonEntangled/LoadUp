import { neon } from "@neondatabase/serverless";
import { compare, hash } from "bcryptjs";

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);

// User type definition
export interface DbUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    return result[0] as DbUser;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(email: string, password: string): Promise<DbUser | null> {
  try {
    const user = await getUserByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}): Promise<DbUser | null> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return null;
    }

    // Hash the password
    const hashedPassword = await hash(userData.password, 10);

    // Insert the user
    const result = await sql`
      INSERT INTO users (email, password, full_name, role, is_active)
      VALUES (${userData.email}, ${hashedPassword}, ${userData.fullName}, ${userData.role}, true)
      RETURNING *
    `;

    return result[0] as DbUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
} 