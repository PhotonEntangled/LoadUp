/** @type {import('next').NextConfig} */

// Add Sentry configuration
const { withSentryConfig } = require('@sentry/nextjs');
const path = require('path'); // Add path require

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove transpilePackages as we are no longer using workspace packages
  // transpilePackages: ['@loadup/database', '@loadup/shared'], 
  experimental: {
    // Server Actions are available by default in Next.js 14.1.0
    instrumentationHook: true
  },
  // Add Vercel-specific configurations
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  // Add output export configuration
  output: 'standalone',
  // Remove rewrites for API as API routes are part of this app
  /* 
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 
          process.env.NODE_ENV === 'production'
            ? `${process.env.API_URL || 'https://api.loadup.com/api'}/:path*`
            : 'http://localhost:3001/api/:path*',
      },
    ];
  },
  */
  // Enable Vercel Analytics
  analyticsId: process.env.VERCEL_ANALYTICS_ID,
  // Temporarily remove custom webpack config
  // webpack: (config, { isServer }) => {
  //   // ... (original content removed for testing) ...
  //   return config;
  // },
};

// Only use Sentry if DSN is provided
if (!process.env.SENTRY_DSN) {
  module.exports = process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
    : nextConfig;
} else {
  // Sentry configuration for Next.js
  const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin
    silent: true, // Suppresses all logs
    dryRun: false,
    
    // For Next.js 14, we should use the instrumentation hook instead of the webpack plugins
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    
    // Allow Sentry to handle errors gracefully
    errorHandler: (err, invokeErr, compilation) => {
      compilation.warnings.push('Sentry webpack plugin error: ' + err.message);
      return null; // Don't fail the build for Sentry errors
    },
  };

  // Export with Sentry configuration applied
  module.exports = process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
      })(withSentryConfig(nextConfig, sentryWebpackPluginOptions))
    : withSentryConfig(nextConfig, sentryWebpackPluginOptions);
} 