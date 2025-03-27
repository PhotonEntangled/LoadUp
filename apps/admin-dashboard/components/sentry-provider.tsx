"use client";

import { ReactNode, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface SentryProviderProps {
  children: ReactNode;
}

export function SentryProvider({ children }: SentryProviderProps) {
  useEffect(() => {
    // Only initialize Sentry on the client side
    if (typeof window !== "undefined") {
      const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
      
      if (dsn) {
        try {
          Sentry.init({
            dsn,
            tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
            debug: process.env.NODE_ENV !== "production",
            replaysOnErrorSampleRate: 1.0,
            replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,
            integrations: (integrations) => {
              return integrations;
            },
          });
          
          console.log("Sentry initialized successfully");
        } catch (error) {
          console.error("Failed to initialize Sentry:", error);
        }
      } else {
        console.warn("Sentry DSN not found in environment variables");
      }
    }
  }, []);

  return <>{children}</>;
} 