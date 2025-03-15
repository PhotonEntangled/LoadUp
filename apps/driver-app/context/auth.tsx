import { SessionProvider } from "next-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import React from "react";

/**
 * Custom token cache for NextAuth to store session in SecureStore
 * Uses secure storage for mobile authentication tokens
 */
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

/**
 * Auth Provider Component using NextAuth for LoadUp Driver App
 * Wraps the application with SessionProvider for authentication
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // The session prop is optional but can be used to pass a custom session
      // The baseUrl is needed for React Native
      baseUrl={Constants.expoConfig?.extra?.EXPO_PUBLIC_NEXTAUTH_URL}
    >
      {children}
    </SessionProvider>
  );
} 