
May 03 16:19:41.94
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:19:20.88
POST
500
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: $ is not a function at P (/var/task/.next/server/app/api/documents/route.js:1:5692) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 16:19:07.74
GET
500
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/documents
6
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2337)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:19:04.13
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:04.09
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:04.04
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:04.00
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:03.91
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:03.91
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:03.91
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 16:19:03.91
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:03.91
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:03.90
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:19:01.99
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:19:01.68
POST
302
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 16:18:52.57
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:18:52.43
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:17:27.09
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:17:27.06
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:17:26.49
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 16:17:26.24
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:17:26.09
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:17:25.94
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:17:25.90
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:17:25.65
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:17:25.50
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:17:24.90
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 16:17:24.88
GET
200
load-kv5448xi6-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:17:24.69
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:17:24.67
GET
307
load-kv5448xi6-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
