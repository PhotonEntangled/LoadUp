
May 03 00:29:26.87
GET
200
load-ldcphdjf6-photonentangleds-projects.vercel.app
/api/auth/signin
May 03 00:29:26.10
GET
307
load-ldcphdjf6-photonentangleds-projects.vercel.app
/
6
Middleware: No token found. Redirecting to sign-in page.
May 03 00:29:25.10
POST
302
load-ldcphdjf6-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
9
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!





--- MIDDLEWARE EXECUTION START ---
Middleware: Checking auth for protected route: /
Middleware: Incoming cookie names: ["_vercel_jwt","__Host-next-auth.csrf-token","__Secure-next-auth.callback-url","__Secure-next-auth.session-token"]
Middleware: About to call getToken with secret starting: 1QgYsL9nVC... [Length: 43]
Middleware: getToken returned: null
Middleware: No token found. Redirecting to sign-in page.




[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
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
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"