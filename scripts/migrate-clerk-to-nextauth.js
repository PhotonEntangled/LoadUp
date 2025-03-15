#!/usr/bin/env node

/**
 * This script migrates from Clerk.js to NextAuth.js
 * It finds Clerk-related imports, components, and configurations
 * and replaces them with NextAuth equivalents
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define patterns to search for
const patterns = {
  // Import patterns
  imports: [
    { 
      find: /import\s+{\s*.*?\s*}\s+from\s+['"]@clerk\/nextjs['"]/g,
      replace: 'import { useSession, signIn, signOut } from "next-auth/react"'
    },
    { 
      find: /import\s+{\s*.*?\s*}\s+from\s+['"]@clerk\/clerk-expo['"]/g,
      replace: 'import { useSession, signIn, signOut } from "next-auth/react"'
    },
    {
      find: /import\s+{\s*Clerk\s*}\s+from\s+['"]@clerk\/clerk-sdk-node['"]/g,
      replace: 'import { getServerSession } from "next-auth/next"'
    },
  ],
  
  // Component patterns
  components: [
    {
      find: /<SignIn\s+.*?\/>/g,
      replace: '/* Replaced Clerk SignIn with NextAuth */\n<form onSubmit={(e) => { e.preventDefault(); signIn("credentials", { email, password }) }}>\n  {/* Add form fields here */}\n</form>'
    },
    {
      find: /<SignUp\s+.*?\/>/g,
      replace: '/* Replaced Clerk SignUp with NextAuth */\n<form onSubmit={(e) => { e.preventDefault(); /* Registration logic */ }}>\n  {/* Add form fields here */}\n</form>'
    },
    {
      find: /<SignedIn>(.*?)<\/SignedIn>/gs,
      replace: '{session?.user && ($1)}'
    },
    {
      find: /<SignedOut>(.*?)<\/SignedOut>/gs,
      replace: '{!session?.user && ($1)}'
    },
  ],
  
  // Authentication hooks and methods
  hooks: [
    {
      find: /useUser\(\)/g,
      replace: 'useSession()'
    },
    {
      find: /user\?\.(userId|id)/g,
      replace: 'session?.user?.id'
    },
    {
      find: /useClerk\(\)/g,
      replace: 'useSession()'
    },
    {
      find: /useAuth\(\)/g,
      replace: 'useSession()'
    },
    {
      find: /clerk\.sessions\.verifyToken/g,
      replace: 'getServerSession(req, res, authOptions)'
    },
    {
      find: /signIn\.create\(/g,
      replace: 'signIn("credentials", '
    },
    {
      find: /signOut\.create\(/g,
      replace: 'signOut('
    },
  ],
  
  // Environment variables
  envVars: [
    {
      find: /CLERK_SECRET_KEY/g,
      replace: 'NEXTAUTH_SECRET'
    },
    {
      find: /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/g,
      replace: 'NEXTAUTH_URL'
    },
    {
      find: /EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY/g,
      replace: 'EXPO_PUBLIC_NEXTAUTH_URL'
    },
  ]
};

// Function to process a file
async function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  // Skip this migration script itself
  if (filePath.endsWith('migrate-clerk-to-nextauth.js')) {
    return;
  }

  // Only process certain file types
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.ts', '.tsx', '.md', '.json', '.env'].includes(ext)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Process all pattern types
    for (const patternType in patterns) {
      for (const { find, replace } of patterns[patternType]) {
        const originalContent = content;
        content = content.replace(find, replace);
        if (content !== originalContent) {
          modified = true;
          console.log(`✓ Updated ${patternType} in ${path.relative(rootDir, filePath)}`);
        }
      }
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function
async function main() {
  console.log('Starting migration from Clerk.js to NextAuth.js...');
  
  // Get all files in the project
  const files = await glob('**/*', { 
    cwd: rootDir, 
    nodir: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**']
  });
  
  // Process each file
  for (const file of files) {
    await processFile(path.join(rootDir, file));
  }
  
  console.log('\nMigration complete! Please review the changes.');
  console.log('\nNext steps:');
  console.log('1. Install NextAuth dependencies if needed: npm install next-auth @auth/drizzle-adapter');
  console.log('2. Update database schema for NextAuth sessions and users');
  console.log('3. Set up NextAuth API route (create/verify apps/admin-dashboard/app/api/auth/[...nextauth]/route.ts)');
  console.log('4. Add middleware for route protection');
  console.log('5. Update client components to use session logic from NextAuth');

  console.log('\nMissed some replacements? Consider checking for Clerk references with:');
  console.log('   grep -r "clerk" --include="*.{js,jsx,ts,tsx,md,json,env}" .');
}

main().catch(console.error); 