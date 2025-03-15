# Authentication Testing Guide

## Overview

This guide outlines the steps to test the authentication system in the LoadUp admin dashboard to verify if phases 1-3 of the project were successful. The authentication system has been migrated from Clerk.js to NextAuth.js, and we need to ensure that it's working correctly.

## Prerequisites

1. Ensure all environment variables are set correctly:
   - `NEXTAUTH_SECRET` - Secret key for NextAuth.js
   - `NEXTAUTH_URL` - URL of the application (e.g., http://localhost:3000)
   - `DATABASE_URL` - Connection string for the PostgreSQL database

2. Make sure the database is running and accessible.

3. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

## Testing Steps

### 1. Start the Admin Dashboard

```bash
cd apps/admin-dashboard
npm run dev
```

The application should start on http://localhost:3000.

### 2. Access the Sign-In Page

Navigate to http://localhost:3000/sign-in in your browser. You should see the sign-in page with:
- Email input field
- Password input field
- "Sign In" button
- "Don't have an account? Sign Up" link
- "Forgot password?" link

### 3. Test Sign-In Functionality

Try signing in with valid credentials:
- Email: admin@loadup.com
- Password: password123

If the authentication system is working correctly, you should be redirected to the dashboard page after successful sign-in.

### 4. Test Sign-Up Functionality

Navigate to http://localhost:3000/sign-up and try creating a new account:
- Fill in the required fields (name, email, password)
- Click the "Sign Up" button

If the authentication system is working correctly, you should be redirected to the dashboard page after successful sign-up.

### 5. Test Route Protection

Try accessing a protected route directly (e.g., http://localhost:3000/dashboard) without being signed in. You should be redirected to the sign-in page.

### 6. Test Sign-Out Functionality

After signing in, click the "Sign Out" button in the dashboard. You should be redirected to the sign-in page.

### 7. Test Password Reset

Navigate to http://localhost:3000/reset-password and try resetting your password:
- Enter your email address
- Click the "Send Reset Link" button

You should see a confirmation message that a reset link has been sent to your email.

### 8. Test Email Verification

Navigate to http://localhost:3000/verify-email and try verifying your email:
- Enter the verification code
- Click the "Verify Email" button

You should be redirected to the dashboard page after successful verification.

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check that the `DATABASE_URL` environment variable is set correctly
   - Ensure the database is running and accessible
   - Check for any database migration issues

2. **Authentication Issues**
   - Check that the `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables are set correctly
   - Check the browser console for any errors
   - Check the server logs for any authentication-related errors

3. **Routing Issues**
   - Check that the middleware is configured correctly to protect routes
   - Check that the auth layout is redirecting correctly based on the session

### Debugging Tips

1. **Check Server Logs**
   - Look for any errors or warnings in the server logs
   - Check for any authentication-related messages

2. **Check Browser Console**
   - Open the browser developer tools (F12)
   - Check the console for any JavaScript errors
   - Check the network tab for any failed API requests

3. **Check Session Status**
   - Use the browser developer tools to check the session cookie
   - Check the server logs for session-related messages

## Next Steps

If all tests pass, the authentication system is working correctly, and phases 1-3 of the project can be considered successful. The next steps would be:

1. **Enhance User Experience**
   - Add loading states during authentication
   - Improve responsive design for authentication pages
   - Add more comprehensive error messages

2. **Implement Admin Dashboard Features**
   - Create dashboard overview page
   - Implement shipment management components
   - Implement driver management components
   - Add analytics and reporting components

3. **Connect to Backend API**
   - Implement data fetching and caching
   - Add real-time updates
   - Implement error handling for API requests 