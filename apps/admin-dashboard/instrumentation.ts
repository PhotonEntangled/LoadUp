// Next.js instrumentation file for Sentry integration
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server instrumentation - only run on server
    const SENTRY_DSN = process.env.SENTRY_DSN;
    
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
        debug: process.env.NODE_ENV !== 'production',
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        includeLocalVariables: true,
        ignoreErrors: [
          'Error: API resolved without sending a response',
          'ECONNRESET',
          'ECONNREFUSED',
          'socket hang up',
        ],
      });
    }
  } else if (typeof window !== 'undefined') {
    // Client instrumentation - only run in browser
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
        debug: process.env.NODE_ENV !== 'production',
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
        // Use browser integrations
        integrations: (integrations) => {
          return integrations;
        },
        ignoreErrors: [
          'top.GLOBALS',
          'originalCreateNotification',
          'canvas.contentDocument',
          'MyApp_RemoveAllHighlights',
          'http://tt.epicplay.com',
          'Can\'t find variable: ZiteReader',
          'jigsaw is not defined',
          'ComboSearch is not defined',
          'http://loading.retry.widdit.com/',
          'atomicFindClose',
          'fb_xd_fragment',
          'bmi_SafeAddOnload',
          'EBCallBackMessageReceived',
          'conduitPage',
        ],
      });
    }
  }
} 