May 03 17:30:14.81
POST
500
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: $ is not a function at P (/var/task/.next/server/app/api/documents/route.js:1:5542) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 17:29:58.00
GET
500
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/documents
6
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2187)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 17:29:53.36
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:53.31
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:52.68
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:52.65
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:52.61
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:52.61
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:52.61
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:52.61
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 17:29:52.61
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 17:29:52.61
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:50.85
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 17:29:50.47
POST
302
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 17:29:31.60
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 17:29:31.19
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 17:29:26.42
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 17:29:26.38
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 17:29:24.78
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 17:29:24.74
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 17:29:24.65
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 17:29:24.44
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 17:29:24.39
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 17:29:24.11
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 17:29:24.05
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 17:29:23.46
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 17:29:23.42
GET
200
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 17:29:23.29
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 17:29:23.21
GET
307
load-6zwpbu6qa-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
