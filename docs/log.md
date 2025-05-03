[20:43:09.280] Running build in Washington, D.C., USA (East) – iad1
[20:43:09.298] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 798b74f)
[20:43:09.979] Warning: Failed to fetch one or more git submodules
[20:43:09.980] Cloning completed: 681.000ms
[20:43:16.929] Restored build cache from previous deployment (Hcnzt6qc1W49GsSMy3iB1A2aivLf)
[20:43:17.887] Running "vercel build"
[20:43:18.293] Vercel CLI 41.7.0
[20:43:18.721] Running "install" command: `npm install`...
[20:43:22.040] 
[20:43:22.040] removed 20 packages, and audited 1455 packages in 3s
[20:43:22.041] 
[20:43:22.041] 337 packages are looking for funding
[20:43:22.041]   run `npm fund` for details
[20:43:22.074] 
[20:43:22.074] 6 vulnerabilities (5 moderate, 1 high)
[20:43:22.075] 
[20:43:22.075] To address issues that do not require attention, run:
[20:43:22.075]   npm audit fix
[20:43:22.075] 
[20:43:22.075] To address all issues possible (including breaking changes), run:
[20:43:22.075]   npm audit fix --force
[20:43:22.075] 
[20:43:22.076] Some issues need review, and may require choosing
[20:43:22.076] a different dependency.
[20:43:22.076] 
[20:43:22.076] Run `npm audit` for details.
[20:43:22.109] Detected Next.js version: 14.2.28
[20:43:22.110] Running "npm run build"
[20:43:22.232] 
[20:43:22.233] > loadup-admin-dashboard@0.1.0 prebuild
[20:43:22.233] > echo 'Starting build process'
[20:43:22.233] 
[20:43:22.238] Starting build process
[20:43:22.238] 
[20:43:22.239] > loadup-admin-dashboard@0.1.0 build
[20:43:22.239] > next build
[20:43:22.239] 
[20:43:22.942]   ▲ Next.js 14.2.28
[20:43:22.942] 
[20:43:22.972]    Creating an optimized production build ...
[20:43:38.137] Failed to compile.
[20:43:38.138] 
[20:43:38.138] ./app/api/auth/[...nextauth]/options.ts
[20:43:38.138] Module not found: Can't resolve 'next-auth/providers/credentials'
[20:43:38.138] 
[20:43:38.138] https://nextjs.org/docs/messages/module-not-found
[20:43:38.138] 
[20:43:38.138] Import trace for requested module:
[20:43:38.139] ./lib/auth.ts
[20:43:38.139] ./app/dashboard/shipments/page.tsx
[20:43:38.139] 
[20:43:38.139] ./app/dashboard/shipments/page.tsx
[20:43:38.139] Module not found: Can't resolve 'next-auth/react'
[20:43:38.139] 
[20:43:38.139] https://nextjs.org/docs/messages/module-not-found
[20:43:38.139] 
[20:43:38.139] ./components/providers.tsx
[20:43:38.139] Module not found: Can't resolve 'next-auth/react'
[20:43:38.139] 
[20:43:38.139] https://nextjs.org/docs/messages/module-not-found
[20:43:38.139] 
[20:43:38.139] ./lib/auth.ts
[20:43:38.140] Module not found: Can't resolve 'next-auth'
[20:43:38.140] 
[20:43:38.140] https://nextjs.org/docs/messages/module-not-found
[20:43:38.140] 
[20:43:38.140] Import trace for requested module:
[20:43:38.140] ./app/dashboard/shipments/page.tsx
[20:43:38.140] 
[20:43:38.140] ./app/api/auth/[...nextauth]/options.ts
[20:43:38.140] Module not found: Can't resolve 'next-auth/providers/credentials'
[20:43:38.140] 
[20:43:38.140] https://nextjs.org/docs/messages/module-not-found
[20:43:38.140] 
[20:43:38.141] Import trace for requested module:
[20:43:38.141] ./lib/auth.ts
[20:43:38.141] ./app/api/documents/alt-upload/route.ts
[20:43:38.141] 
[20:43:38.149] 
[20:43:38.150] > Build failed because of webpack errors
[20:43:38.176] Error: Command "npm run build" exited with 1
[20:43:38.864] 
[20:43:41.775] Exiting build container