[21:41:47.996] Running build in Washington, D.C., USA (East) – iad1
[21:41:48.012] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: f04175d)
[21:41:48.839] Warning: Failed to fetch one or more git submodules
[21:41:48.840] Cloning completed: 827.000ms
[21:41:52.009] Restored build cache from previous deployment (BmCtKBGSCuVQ3McKRfuK4HynX5HK)
[21:41:53.006] Running "vercel build"
[21:41:53.401] Vercel CLI 41.7.0
[21:41:53.760] Running "install" command: `npm install`...
[21:41:56.929] 
[21:41:56.930] added 1 package, and audited 1476 packages in 3s
[21:41:56.931] 
[21:41:56.931] 344 packages are looking for funding
[21:41:56.931]   run `npm fund` for details
[21:41:56.960] 
[21:41:56.961] 6 vulnerabilities (5 moderate, 1 high)
[21:41:56.961] 
[21:41:56.961] To address issues that do not require attention, run:
[21:41:56.962]   npm audit fix
[21:41:56.962] 
[21:41:56.962] To address all issues possible (including breaking changes), run:
[21:41:56.962]   npm audit fix --force
[21:41:56.963] 
[21:41:56.963] Some issues need review, and may require choosing
[21:41:56.963] a different dependency.
[21:41:56.963] 
[21:41:56.963] Run `npm audit` for details.
[21:41:57.021] Detected Next.js version: 14.2.28
[21:41:57.022] Running "npm run build"
[21:41:57.214] 
[21:41:57.214] > loadup-admin-dashboard@0.1.0 prebuild
[21:41:57.214] > echo 'Starting build process'
[21:41:57.215] 
[21:41:57.221] Starting build process
[21:41:57.222] 
[21:41:57.222] > loadup-admin-dashboard@0.1.0 build
[21:41:57.222] > next build
[21:41:57.223] 
[21:41:58.534]   ▲ Next.js 14.2.28
[21:41:58.535] 
[21:41:58.632]    Creating an optimized production build ...
[21:42:15.643] Failed to compile.
[21:42:15.643] 
[21:42:15.644] ./lib/database/drizzle.ts
[21:42:15.644] Error: 
[21:42:15.644]   [31mx[0m You're importing a component that needs server-only. That only works in a Server Component which is not supported in the pages/ directory. Read more: https://nextjs.org/docs/getting-started/
[21:42:15.644]   [31m|[0m react-essentials#server-components
[21:42:15.644]   [31m|[0m 
[21:42:15.644]   [31m|[0m 
[21:42:15.644]    ,-[[36;1;4m/vercel/path0/lib/database/drizzle.ts[0m:1:1]
[21:42:15.644]  [2m1[0m | import 'server-only'; // Ensures this module only runs on the server
[21:42:15.644]    : [31;1m^^^^^^^^^^^^^^^^^^^^^[0m
[21:42:15.644]  [2m2[0m | import { neon } from '@neondatabase/serverless';
[21:42:15.644]  [2m3[0m | import { drizzle } from 'drizzle-orm/neon-http';
[21:42:15.644]  [2m4[0m | import { logger } from '@/utils/logger';
[21:42:15.644]    `----
[21:42:15.644] 
[21:42:15.645] Import trace for requested module:
[21:42:15.645] ./lib/database/drizzle.ts
[21:42:15.645] ./lib/auth.ts
[21:42:15.645] ./components/Sidebar.tsx
[21:42:15.645] ./components/main-layout.tsx
[21:42:15.645] 
[21:42:15.660] 
[21:42:15.660] > Build failed because of webpack errors
[21:42:15.691] Error: Command "npm run build" exited with 1
[21:42:16.384] 
[21:42:19.430] Exiting build container