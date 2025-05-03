May 03 16:05:02.99
POST
500
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: $ is not a function at P (/var/task/.next/server/app/api/documents/route.js:1:5692) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 16:04:54.53
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.51
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.42
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.35
GET
500
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/documents
2
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2337)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:04:54.35
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:04:53.64
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:48.42
GET
500
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/documents
6
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2337)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:04:32.95
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.91
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.86
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.78
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.64
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:04:31.27
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:30.66
POST
302
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 16:04:21.24
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:04:21.11
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:09.28
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:09.23
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:07.80
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 16:04:07.69
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:07.65
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:07.57
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:07.53
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:07.30
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:07.16
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:06.48
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 16:04:06.43
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:04:06.30
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:06.22
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:05:02.99
POST
500
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/documents
2
⨯ TypeError: $ is not a function at P (/var/task/.next/server/app/api/documents/route.js:1:5692) at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417 at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580) at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155) at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916) at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103 at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124) at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)
May 03 16:04:54.53
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.51
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.42
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 16:04:54.38
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:54.35
GET
500
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/documents
2
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2337)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:04:54.35
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:04:53.64
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:48.42
GET
500
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/documents
6
[ERROR] API: Error fetching documents: $ is not a function { stack: 'TypeError: $ is not a function\n' + ' at T (/var/task/.next/server/app/api/documents/route.js:1:2337)\n' + ' at /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:140:36\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)\n' + ' at NoopTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18155)\n' + ' at ProxyTracer.startActiveSpan (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18916)\n' + ' at /var/task/node_modules/next/dist/server/lib/trace/tracer.js:122:103\n' + ' at NoopContextManager.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7124)\n' + ' at ContextAPI.with (/var/task/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:580)' }
May 03 16:04:32.95
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/settings
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.91
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/reports
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.86
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/drivers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.78
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/customers
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/simulation
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/tracking-stabilized
2
Middleware: Route /tracking-stabilized does not require auth. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/documents
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.67
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/dashboard/shipments
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:32.64
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/session
7
[AUTH CALLBACK] Added token data to session object: { id: undefined, email: 'dev@loadup.com', role: undefined, name: 'Development User' }
May 03 16:04:31.27
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: Token found for dev@loadup.com. Allowing access.
May 03 16:04:30.66
POST
302
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 16:04:21.24
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:04:21.11
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:09.28
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:09.23
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:07.80
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 16:04:07.69
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:07.65
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:07.57
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:07.53
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:07.30
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 16:04:07.16
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:06.48
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 16:04:06.43
GET
200
load-phrwxmrb9-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 16:04:06.30
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 16:04:06.22
GET
307
load-phrwxmrb9-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
