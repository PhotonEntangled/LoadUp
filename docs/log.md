May 03 18:29:43.06
POST
500
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: h is not a function at D (/var/task/.next/server/app/api/documents/route.js:1:2279) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 18:29:33.16
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/documents
5
[INFO] API: GET /api/documents called (MINIMAL TEST)
May 03 18:29:28.81
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.72
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.68
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.15
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.07
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 18:29:28.07
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.07
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.06
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.06
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:28.05
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 18:29:26.27
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:29:25.74
POST
302
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 18:29:18.14
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 18:29:17.99
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:28:27.17
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:28:27.14
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:28:26.72
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 18:28:26.47
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:28:26.39
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:28:26.37
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:28:26.22
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:28:26.21
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:28:25.86
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:28:25.34
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 18:28:25.27
GET
200
load-atl3l0f6y-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 18:28:25.18
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:28:25.07
GET
307
load-atl3l0f6y-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
