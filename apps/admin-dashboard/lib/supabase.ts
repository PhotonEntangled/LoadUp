import { createClient } from '@supabase/supabase-js';
import { UserRole } from './auth.config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://loadup.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the browser and server
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sign up a new user
export async function signUpUser({ 
  email, 
  password, 
  name, 
  companyId,
  role = 'customer'
}: { 
  email: string; 
  password: string; 
  name: string; 
  companyId?: string;
  role?: UserRole;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        company_id: companyId,
        role: role,
      },
    },
  });
  
  return { data, error };
}

// Helper function to sign in a user
export async function signInUser({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Helper function to sign out a user
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Helper function to get the current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to get user metadata
export async function getUserMetadata() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata;
}

// Helper function to update user role
export async function updateUserRole(userId: string, role: UserRole) {
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { role } }
  );
  
  return { data, error };
} 