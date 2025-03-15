#!/usr/bin/env node
/**
 * PR Checklist Generator for Clerk to NextAuth Migration
 * 
 * This script generates a PR checklist for the Clerk to NextAuth migration
 * and outputs it to docs/PR_CHECKLIST.md.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the output checklist file
const CHECKLIST_PATH = path.join(process.cwd(), 'docs', 'PR_CHECKLIST.md');
// Path to the Clerk references file
const REFERENCES_PATH = path.join(process.cwd(), 'docs', 'CLERK_REFERENCES.md');

/**
 * Runs a command and returns its output
 */
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return '';
  }
}

/**
 * Gets the number of remaining Clerk references in the codebase
 */
function getClerkReferenceCount() {
  try {
    // Run the find-clerk-references.js script and capture its output
    const scriptPath = path.join(process.cwd(), 'scripts', 'find-clerk-references.js');
    if (fs.existsSync(scriptPath)) {
      const output = runCommand(`node ${scriptPath}`);
      // Extract the count from the output
      const match = output.match(/Found (\d+) Clerk references/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // Fallback: Count references in the CLERK_REFERENCES.md file
    if (fs.existsSync(REFERENCES_PATH)) {
      const content = fs.readFileSync(REFERENCES_PATH, 'utf8');
      // Look for the summary line
      const match = content.match(/Total Clerk References:\s*(\d+)\+?/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error getting Clerk reference count:', error);
    return 'Error';
  }
}

/**
 * Gets the status of the tests
 */
function getTestStatus() {
  try {
    // Run a specific test to check status
    const authSecurityTest = runCommand('npm test -- --testPathPattern=auth.security');
    const authSecurityPassing = authSecurityTest.includes('2 passed');

    const nextAuthTest = runCommand('npm test -- --testPathPattern=nextauth.integration');
    const nextAuthPassing = !nextAuthTest.includes('fail');

    return {
      authSecurityPassing,
      nextAuthPassing,
      testOutput: `Auth Security: ${authSecurityPassing ? 'Passing' : 'Failing'}\nNextAuth Integration: ${nextAuthPassing ? 'Passing' : 'Failing'}`
    };
  } catch (error) {
    console.error('Error getting test status:', error);
    return {
      authSecurityPassing: false,
      nextAuthPassing: false,
      testOutput: 'Error running tests'
    };
  }
}

/**
 * Gets the current branch name
 */
function getBranchName() {
  return runCommand('git branch --show-current');
}

/**
 * Gets the list of modified files
 */
function getModifiedFiles() {
  return runCommand('git diff --name-only').split('\n');
}

/**
 * Generates the PR checklist markdown
 */
function generateChecklist() {
  const branchName = getBranchName();
  const clerkReferenceCount = getClerkReferenceCount();
  const { authSecurityPassing, nextAuthPassing, testOutput } = getTestStatus();
  const modifiedFiles = getModifiedFiles();
  
  // Count modified files by type
  const fileTypes = {
    ts: 0,
    tsx: 0,
    js: 0,
    jsx: 0,
    md: 0,
    other: 0
  };
  
  modifiedFiles.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.ts') fileTypes.ts++;
    else if (ext === '.tsx') fileTypes.tsx++;
    else if (ext === '.js') fileTypes.js++;
    else if (ext === '.jsx') fileTypes.jsx++;
    else if (ext === '.md') fileTypes.md++;
    else fileTypes.other++;
  });

  const content = `# Pull Request Checklist: Clerk to NextAuth Migration

## Current Status (Auto-generated)

- **Branch:** ${branchName}
- **Remaining Clerk References:** ${clerkReferenceCount}
- **Auth Security Tests:** ${authSecurityPassing ? '✅ Passing' : '❌ Failing'}
- **NextAuth Integration Tests:** ${nextAuthPassing ? '✅ Passing' : '❌ Failing'}
- **Modified Files:** ${modifiedFiles.length} (${fileTypes.ts} TS, ${fileTypes.tsx} TSX, ${fileTypes.js} JS, ${fileTypes.jsx} JSX, ${fileTypes.md} MD, ${fileTypes.other} Other)

## PR Readiness Checklist

### Core Implementation
- [ ] NextAuth API route implemented and working
- [ ] Authentication hooks updated to use NextAuth
- [ ] User sessions working correctly
- [ ] Role-based access control implemented

### Code Cleanup
- [ ] All Clerk dependencies removed from package.json files
- [ ] All Clerk API references replaced with NextAuth equivalents
- [ ] Environment variables updated to NextAuth format
- [ ] No remaining Clerk imports in codebase

### Testing
- [ ] Auth security tests passing
- [ ] NextAuth integration tests passing
- [ ] Manual testing of login/logout functionality
- [ ] Manual testing of protected routes
- [ ] Manual testing of role-based access

### Documentation
- [ ] Migration guide complete and up-to-date
- [ ] README updated to reflect NextAuth usage
- [ ] Deployment documentation updated
- [ ] API documentation updated if necessary

### Review Readiness
- [ ] PR description clearly explains the migration
- [ ] PR includes links to related issues
- [ ] PR includes testing instructions for reviewers
- [ ] PR includes migration guide reference

## Test Output

\`\`\`
${testOutput}
\`\`\`

## Remaining Files with Clerk References

See \`docs/CLERK_REFERENCES.md\` for the complete list.

## Notes for Reviewers

- The migration from Clerk to NextAuth requires changes across multiple packages
- Core authentication functionality has been preserved but implementation details have changed
- API endpoints that rely on authentication should function identically
- UI components that display user information may need additional updates
`;

  return content;
}

/**
 * Main function
 */
function main() {
  try {
    // Create the docs directory if it doesn't exist
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generate and write the checklist
    const checklist = generateChecklist();
    fs.writeFileSync(CHECKLIST_PATH, checklist);
    
    console.log(`PR checklist generated at ${CHECKLIST_PATH}`);
  } catch (error) {
    console.error('Error generating PR checklist:', error);
    process.exit(1);
  }
}

main(); 