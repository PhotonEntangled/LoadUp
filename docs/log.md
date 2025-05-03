May 03 16:30:48.80
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:30:42.46
POST
500
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: $ is not a function at P (/var/task/.next/server/app/api/documents/route.js:1:5542) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 16:30:34.31
GET
500
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/documents
2
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2187)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:30:30.99
GET
500
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/documents
6
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2187)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:30:25.17
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:25.13
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:25.09
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:25.04
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:24.93
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:24.93
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:24.93
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 16:30:24.93
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:24.92
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:24.91
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:30:23.47
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:30:23.07
POST
302
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 16:30:09.73
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:30:09.58
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:24.33
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:29:24.29
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:23.52
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:29:23.18
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:23.18
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 16:29:23.00
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:29:22.94
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:29:22.90
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:22.83
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:22.77
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:29:22.74
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:22.10
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 16:29:22.05
GET
200
load-74tc3cm00-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:29:21.91
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:29:21.80
GET
307
load-74tc3cm00-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
