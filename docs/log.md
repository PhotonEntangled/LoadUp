
May 03 00:40:08.54
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 00:40:08.43
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 00:40:07.86
POST
302
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 03 00:39:57.32
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 00:39:57.19
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 00:39:54.25
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 03 00:39:53.68
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 00:39:53.63
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 00:39:12.53
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 00:39:12.37
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 00:39:12.20
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 00:39:12.04
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 00:39:11.41
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 03 00:39:11.32
GET
200
load-j7vyu2a01-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 03 00:39:11.26
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.
May 03 00:39:11.09
GET
307
load-j7vyu2a01-photonentangleds-projects.vercel.app
/
8
Middleware: No token found. Redirecting to sign-in page.





--- MIDDLEWARE EXECUTION START ---
Middleware: Checking auth for protected route: /
Middleware: Incoming cookie names: ["_vercel_jwt","__Host-next-auth.csrf-token","__Secure-next-auth.callback-url","__Secure-next-auth.session-token"]
Middleware: Raw session cookie found: Yes
Middleware: About to call getToken with secret starting: 1QgYsL9nVC... [Length: 43]
Middleware: getToken (parsed) returned: null
Middleware: getToken (raw) returned: null/undefined
Middleware: No token found. Redirecting to sign-in page.





[AUTH DEBUG] Comparing provided password: 'password'
[AUTH DEBUG] Against stored hash for dev@loadup.com: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
[AUTH DEBUG] Login successful (BYPASS) for: dev@loadup.com
[AUTH CALLBACK] JWT Callback triggered
[AUTH CALLBACK] JWT using secret starting: 1QgYsL9nVC... [Length: 43]
[AUTH CALLBACK] Added user data to JWT token: {
  id: 'dev-user-01',
  email: 'dev@loadup.com',
  role: 'admin',
  name: 'Development User'
}