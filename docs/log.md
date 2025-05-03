May 03 19:29:12.00
POST
500
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: S is not a function at x (/var/task/.next/server/app/api/documents/route.js:1:2373) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 19:29:04.14
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/documents
3
[INFO] API: GET /api/documents called (MINIMAL TEST)
May 03 19:28:58.21
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:58.17
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:58.11
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:57.99
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:57.96
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:57.95
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:57.95
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:57.95
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 19:28:57.95
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:57.94
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 19:28:56.26
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 19:28:55.71
POST
302
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 19:28:48.39
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 19:28:47.96
GET
307
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 19:28:44.14
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 19:28:43.76
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 19:28:43.72
GET
307
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 19:27:22.84
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 19:27:22.68
GET
307
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 19:27:22.39
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 19:27:22.26
GET
307
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 19:27:21.58
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 19:27:21.53
GET
200
load-cg6zokiwj-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 19:27:21.43
GET
307
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 19:27:21.33
GET
307
load-cg6zokiwj-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.






[INFO] API: POST /api/documents called
⨯ TypeError: S is not a function
    at x (/var/task/.next/server/app/api/documents/route.js:1:2373)
    at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
    at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36
    at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)
    at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
    at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)
    at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)
    at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103
    at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)
    at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)