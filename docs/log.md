[17:21:03.768] Running build in Washington, D.C., USA (East) – iad1
[17:21:03.783] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 4a84579)
[17:21:04.363] Warning: Failed to fetch one or more git submodules
[17:21:04.364] Cloning completed: 580.000ms
[17:21:07.940] Restored build cache from previous deployment (7BPDtLBT6wyrbPBcQifoQkonoTRS)
[17:21:08.918] Running "vercel build"
[17:21:09.311] Vercel CLI 41.7.0
[17:21:09.674] Running "install" command: `npm install`...
[17:21:12.882] 
[17:21:12.882] up to date, audited 1475 packages in 3s
[17:21:12.882] 
[17:21:12.883] 343 packages are looking for funding
[17:21:12.883]   run `npm fund` for details
[17:21:12.906] 
[17:21:12.906] 5 vulnerabilities (4 moderate, 1 high)
[17:21:12.907] 
[17:21:12.907] To address all issues possible (including breaking changes), run:
[17:21:12.907]   npm audit fix --force
[17:21:12.908] 
[17:21:12.908] Some issues need review, and may require choosing
[17:21:12.908] a different dependency.
[17:21:12.910] 
[17:21:12.911] Run `npm audit` for details.
[17:21:12.943] Detected Next.js version: 14.2.28
[17:21:12.943] Running "npm run build"
[17:21:13.064] 
[17:21:13.064] > loadup-admin-dashboard@0.1.0 prebuild
[17:21:13.064] > echo 'Starting build process'
[17:21:13.064] 
[17:21:13.069] Starting build process
[17:21:13.070] 
[17:21:13.070] > loadup-admin-dashboard@0.1.0 build
[17:21:13.071] > next build
[17:21:13.071] 
[17:21:13.813]   ▲ Next.js 14.2.28
[17:21:13.814] 
[17:21:13.845]    Creating an optimized production build ...
[17:21:24.240] Failed to compile.
[17:21:24.241] 
[17:21:24.241] ./app/auth/forgot-password/page.tsx
[17:21:24.241] Module not found: Can't resolve '@/app/auth/_components/AuthForm'
[17:21:24.242] 
[17:21:24.242] https://nextjs.org/docs/messages/module-not-found
[17:21:24.242] 
[17:21:24.242] ./app/dashboard/customer/success/page.tsx
[17:21:24.243] Module not found: Can't resolve '@/lib/simple-auth'
[17:21:24.243] 
[17:21:24.243] https://nextjs.org/docs/messages/module-not-found
[17:21:24.243] 
[17:21:24.244] ./app/dashboard/driver/success/page.tsx
[17:21:24.244] Module not found: Can't resolve '@/lib/simple-auth'
[17:21:24.244] 
[17:21:24.244] https://nextjs.org/docs/messages/module-not-found
[17:21:24.244] 
[17:21:24.263] 
[17:21:24.264] > Build failed because of webpack errors
[17:21:24.336] Error: Command "npm run build" exited with 1
[17:21:25.005] 
[17:21:28.047] Exiting build container