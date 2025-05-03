May 03 18:55:02.39
POST
500
load-1lff030ai-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: S is not a function at x (/var/task/.next/server/app/api/documents/route.js:1:2266) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 18:54:30.59
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 18:53:00.61
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/documents
5
[INFO] API: GET /api/documents called (MINIMAL TEST)
May 03 18:52:52.07
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:52.03
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.98
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.94
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.88
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.88
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.88
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 18:52:51.88
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.87
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:51.87
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 18:52:50.26
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 18:52:49.08
POST
302
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 18:52:40.15
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:52:39.74
GET
307
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:52:26.34
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 18:52:25.82
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 18:52:25.72
GET
307
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:51:55.34
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:51:55.31
GET
307
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:51:55.01
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 18:51:54.87
GET
307
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:51:54.23
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 18:51:54.20
GET
200
load-1lff030ai-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 18:51:54.04
GET
307
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 18:51:54.01
GET
307
load-1lff030ai-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
