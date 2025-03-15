# LoadUp Project Session Context
## Updated: May 15, 2024

## 🎯 Current Project State

LoadUp is a modern logistics platform in final beta preparation. The project has completed core implementation and is now focusing on fixing critical issues before beta launch.

### 1. Core Features Status
- ✅ Shipment management system
- ✅ Real-time driver tracking
- ✅ Barcode scanning for deliveries
- ✅ OCR-powered shipment processing
- ✅ API server with mock endpoints implemented
- 🚧 Admin Dashboard (in progress)
- 🚧 Driver App (in progress)
- ✅ Authentication integration (completed)

### 2. Infrastructure Status
- 🚧 CI/CD pipeline (needs implementation)
- ✅ Database schema optimized
- ✅ API endpoints implemented and tested
- ✅ Authentication system (integrated with NextAuth)
- ✅ Build system configuration updated
- ✅ Beta deployment script fixed and working

### 3. Resolved Issues
- ✅ Module resolution issues in monitoring scripts
- ✅ Path alias configuration adjusted
- ✅ Package structure aligned
- ✅ Missing essential dev dependencies added
- ✅ TypeScript path aliases now working
- ✅ Package.json workspace dependencies aligned
- ✅ API server now running correctly with ES modules
- ✅ Beta deployment script fixed to run server in background
- ✅ Server file converted to CommonJS format for compatibility
- ✅ Fixed import issues in useAuth hook (removed .js extensions)
- ✅ Documentation consolidated into README.md, DEVELOPMENT.md, and DEPLOYMENT.md
- ✅ Fixed circular dependencies in database schema by updating import paths with .js extensions
- ✅ Installed missing @google-cloud/vision package for API server
- ✅ Successfully set up and configured browser tools for debugging
- ✅ Identified and documented remaining schema reference issues
- ✅ Migrated authentication from Clerk.js to NextAuth with database integration
- ✅ Updated middleware to properly handle authentication
- ✅ Removed development notice about disabled authentication

### 4. Current Blockers
- 🚫 Admin Dashboard rendering issues (black screen)
- 🚫 CI/CD pipeline not set up
- 🚫 Remaining schema reference issues in shipments table (assignedDriverId references users instead of drivers)
- 🚫 Need to implement proper error handling in API endpoints
- 🚫 Need to add comprehensive testing for API endpoints
- 🚫 Need to implement UI for beta server endpoints (currently JSON-only)

## 🔄 Current Focus Areas

### 1. Admin Dashboard
- Fix rendering issues (black screen)
- Implement proper error handling
- Add comprehensive testing
- Ensure responsive design

### 2. API Server Enhancement
- Add proper error handling to API endpoints
- Implement request validation with Zod
- Add comprehensive testing for API endpoints
- Connect API to actual database instead of mock data
- Create UI for interacting with API endpoints

### 3. CI/CD Implementation
- Set up GitHub Actions workflow
- Configure automated testing
- Implement deployment pipeline
- Set up monitoring and alerting
- Create documentation for CI/CD process

### 4. Package Management
- Fix remaining schema reference issues (assignedDriverId in shipments table)
- Standardize package versions across workspace
- Create centralized version tracking

## 📚 Technical Stack

### Frontend
- Admin Dashboard: Next.js 14, TailwindCSS
- Driver App: React Native (Expo)
- State Management: Zustand
- Maps: Mapbox

### Backend
- API: Node.js with Express.js and TypeScript
- Database: PostgreSQL with Drizzle ORM
- ETL: Custom pipeline with Google Cloud Vision
- Auth: NextAuth with PostgreSQL database

### Infrastructure
- CI/CD: GitHub Actions
- Hosting: Vercel (Admin), Expo (Driver)
- Monitoring: Beta server logs

## 🛠️ MCP Tools Available

The following MCP (Multi-Context Processing) tools are available for use in this project. These tools provide powerful capabilities for debugging, analysis, and development:

### Browser Tools
- `mcp__takeScreenshot`: Captures the current browser state for visual debugging
- `mcp__getConsoleLogs`: Retrieves console logs for debugging JavaScript issues
- `mcp__getConsoleErrors`: Retrieves console errors for identifying critical issues
- `mcp__getNetworkLogs`: Analyzes API requests and responses
- `mcp__getNetworkErrors`: Identifies network-related errors
- `mcp__getSelectedElement`: Retrieves information about the currently selected DOM element
- `mcp__wipeLogs`: Clears all browser logs from memory

### Audit Tools
- `mcp__runAccessibilityAudit`: Evaluates accessibility compliance
- `mcp__runPerformanceAudit`: Analyzes performance metrics and bottlenecks
- `mcp__runSEOAudit`: Checks search engine optimization best practices
- `mcp__runBestPracticesAudit`: Verifies adherence to web development best practices
- `mcp__runNextJSAudit`: Specific audit for Next.js applications
- `mcp__runAuditMode`: Comprehensive audit for SEO, accessibility, and performance

### Debugging Tools
- `mcp__runDebuggerMode`: Interactive debugging for complex issues
- `mcp__sequentialthinking`: Structured problem-solving through step-by-step analysis

### UI Component Tools
- `mcp__21st_magic_component_builder`: Generates UI components based on requirements
- `mcp__21st_magic_component_inspiration`: Provides inspiration for UI components
- `mcp__logo_search`: Searches and returns logos in specified formats

### GitHub Tools
- Various GitHub integration tools for repository management, file operations, and issue tracking

## How to Use MCP Tools

### For Debugging Admin Dashboard Issues
1. Use `mcp__takeScreenshot` to capture the current state of the dashboard
2. Check for errors with `mcp__getConsoleErrors` and `mcp__getNetworkErrors`
3. Analyze network requests with `mcp__getNetworkLogs`
4. Run audits with `mcp__runPerformanceAudit` or `mcp__runNextJSAudit`
5. Use `mcp__runDebuggerMode` for interactive debugging

### For UI Development
1. Use `mcp__21st_magic_component_builder` to generate new UI components
2. Get inspiration with `mcp__21st_magic_component_inspiration`
3. Add logos with `mcp__logo_search`
4. Verify accessibility with `mcp__runAccessibilityAudit`

### For Complex Problem Solving
1. Use `mcp__sequentialthinking` to break down problems into manageable steps
2. Analyze each step methodically
3. Revise thinking as new information becomes available
4. Generate and verify hypotheses

## 🎯 Immediate Action Items

### 1. Admin Dashboard
- Debug and fix black screen issue
  - Use `mcp__takeScreenshot` to capture the current state
  - Check for errors with `mcp__getConsoleErrors`
  - Analyze network requests with `mcp__getNetworkLogs`
  - Use `mcp__runDebuggerMode` for interactive debugging
- Create comprehensive test suite
- Document component structure

### 2. CI/CD Pipeline
- Set up GitHub Actions workflow
- Configure automated testing
- Implement deployment pipeline
- Create documentation for CI/CD process

### 3. API Server
- Implement proper error handling
- Add request validation
- Connect to actual database
- Create UI for beta server endpoints

### 4. Database Schema
- Fix the reference issue in shipments table (assignedDriverId should reference drivers.id, not users.id)
- Ensure all relations are properly defined
- Test database queries to verify schema integrity

## 🔐 Required Secrets

### GitHub Secrets
```
DATABASE_URL=postgresql://postgres:yIJDCYyiqMZOR2hv@db.erztlignabdsmcflipjv.supabase.co:5432/postgres
VERCEL_AUTH_TOKEN=8ruzBaa2ZP3zsEO7vkaMeFS3
EXPO_ACCESS_TOKEN=
```

### Environment Variables
```
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbTg2aW5iYzAwNG42MmlzYm9ndHEyMmZuIn0.ixwS0P7DC44448wA6cRj7g
EXPO_PUBLIC_NEXTAUTH_URL=
GOOGLE_CLOUD_VISION_CREDENTIALS=
```

## 📦 Latest Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "next-auth": "^5.0.0-beta.4",
    "@neondatabase/serverless": "^0.6.0",
    "bcryptjs": "^2.4.3",
    "expo": "^49.0.0",
    "drizzle-orm": "^0.29.3",
    "@google-cloud/vision": "^4.0.2",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/body-parser": "latest",
    "@types/express": "latest",
    "@types/node": "latest",
    "@types/jest": "latest",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## 🚀 Next Steps

### Immediate Actions (24h)
1. Fix Admin Dashboard rendering issues
   - Debug and fix black screen issue using MCP browser tools
   - Test with NextAuth integration
   - Verify authentication flow

2. Set up CI/CD pipeline
   - Configure GitHub Actions workflow
   - Set up automated testing
   - Implement deployment pipeline

3. Enhance API server
   - Add proper error handling
   - Implement request validation with Zod
   - Connect to actual database
   - Create UI for beta server endpoints

4. Fix Database Schema Issues
   - Update shipments table references
   - Test database queries
   - Verify schema integrity

### Short-term (1 week)
1. Complete monitoring system implementation
2. Add comprehensive testing
3. Document new structure
4. Deploy beta version with UI

### Resource Needs
- Database optimization expertise
- Testing expertise
- Performance optimization
- UI/UX design for beta server

## 🏁 Recent Accomplishments

1. Successfully fixed beta deployment script to run server in background
2. Created CommonJS version of server for better compatibility
3. Implemented proper logging for beta server
4. Created comprehensive beta deployment guide
5. Verified server is responding correctly to API requests
6. Added error handling middleware to beta server
7. Fixed import issues in useAuth hook (removed .js extensions)
8. Consolidated documentation into three main files (README.md, DEVELOPMENT.md, DEPLOYMENT.md)
9. Successfully installed and configured browser tools for debugging
10. Fixed circular dependencies in database schema by updating import paths
11. Installed missing @google-cloud/vision package for API server
12. Identified and documented remaining schema reference issues
13. Successfully started the admin dashboard and API server
14. Migrated authentication from Clerk.js to NextAuth with database integration
15. Updated middleware to properly handle authentication
16. Removed development notice about disabled authentication

## 🔍 Beta Server Status

The beta server is currently running on port 3002 with the following endpoints:
- Health check: http://localhost:3002/health
- Shipments API: http://localhost:3002/api/shipments
- Drivers API: http://localhost:3002/api/drivers

The server is returning JSON data correctly, but there is no UI for interacting with these endpoints. The next step is to create a simple UI to make the beta testing experience more user-friendly.

## 🧪 Known Issues and Debugging Tips

1. **PowerShell Command Chaining**
   - PowerShell doesn't support the `&&` operator for command chaining
   - Use semicolons (`;`) instead: `cd apps/admin-dashboard; npm run dev`

2. **Port Conflicts**
   - Multiple instances of Next.js may cause port conflicts
   - Use `Stop-Process -Name "node" -Force` to clear all Node.js processes
   - Restart services in order: browser-tools-server, admin-dashboard, browser-tools-mcp

3. **Module Resolution**
   - Ensure consistent file extensions in imports
   - Use "moduleResolution": "bundler" in tsconfig.json
   - Avoid mixing .js and .ts extensions in imports

4. **Browser Tools Connection**
   - Ensure browser-tools-server is running on port 3025
   - Ensure browser-tools-mcp is connected to the server
   - Navigate to the correct URL in the browser (http://localhost:3000)
   - If tools disconnect, restart with:
     ```bash
     npx @agentdeskai/browser-tools-server@1.2.0
     npx @agentdeskai/browser-tools-mcp@1.2.0
     ```

5. **Debugging Admin Dashboard Black Screen**
   - Use MCP browser tools to capture screenshots and console errors
   - Check for JavaScript errors in the console
   - Verify that all required environment variables are set
   - Check for network errors in API requests
   - Use the debugger mode for interactive debugging

6. **Database Schema Reference Issues**
   - Check that all foreign key references point to the correct tables
   - Ensure that the assignedDriverId in shipments table references drivers.id, not users.id
   - Verify that all imports use .js extensions for ESM compatibility

7. **NextAuth Authentication Issues**
   - Ensure NEXTAUTH_SECRET and NEXTAUTH_URL environment variables are set
   - Check database connection for user authentication
   - Verify that the middleware is correctly configured
   - Check session provider is properly set up in the app layout

## 📚 Documentation Structure

The project documentation has been consolidated into three main files:

1. **README.md** - Main project documentation with:
   - Project overview and features
   - Tech stack details
   - Project structure
   - Getting started instructions
   - Testing procedures
   - Mobile app development guidelines
   - Documentation links

2. **DEVELOPMENT.md** - Comprehensive development guide with:
   - Project structure details
   - Development environment setup
   - State management with Zustand
   - Authentication with NextAuth
   - API integration best practices
   - Error handling approaches
   - Performance optimization techniques
   - Database & ORM (Drizzle) usage
   - Testing strategies
   - ETL process for shipment data
   - Windows PowerShell development notes

3. **DEPLOYMENT.md** - Detailed deployment guide covering:
   - Prerequisites and environment variables
   - API deployment to various platforms
   - Admin Dashboard deployment
   - Driver App deployment
   - Database setup and migrations
   - Monitoring and logging configuration
   - Troubleshooting common issues

## 💻 Windows PowerShell Development Notes

When developing on Windows with PowerShell, keep these important differences in mind:

1. **Command Chaining**
   - PowerShell doesn't support the `&&` operator for command chaining
   - Use semicolons (`;`) instead: `cd apps/admin-dashboard; npm run dev`
   - For more complex operations, consider using PowerShell scripts

2. **Background Processes**
   - To run processes in the background, use PowerShell's Start-Process cmdlet
   - Alternatively, use the background option in terminal commands
   - Example: `Start-Process -NoNewWindow npm -ArgumentList "run dev"`

3. **Path Separators**
   - PowerShell accepts both forward slashes (`/`) and backslashes (`\`) in paths
   - For consistency with cross-platform code, prefer forward slashes

4. **Permission Issues**
   - When encountering "operation not permitted" errors, try running PowerShell as administrator
   - For file system operations, check Windows file permissions

5. **Environment Variables**
   - Set environment variables using `$env:VARIABLE_NAME = "value"`
   - For persistent variables, use System Properties > Environment Variables

This context represents the current state of the LoadUp project. The immediate focus is on fixing the remaining database schema issues, debugging the Admin Dashboard black screen, and enhancing the API server with proper error handling and validation. 