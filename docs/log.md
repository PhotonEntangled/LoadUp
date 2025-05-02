May 02 22:37:27.30
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
May 02 22:37:26.95
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
Middleware: No token found. Redirecting to sign-in page.
May 02 22:37:26.37
POST
302
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/callback/credentials
7
[AUTH DEBUG] !!! BYPASSING bcrypt.compare FOR dev@loadup.com !!!
May 02 22:37:16.05
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
May 02 22:37:15.90
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
Middleware: No token found. Redirecting to sign-in page.
May 02 22:36:57.97
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/favicon.png
--- MIDDLEWARE EXECUTION START ---
May 02 22:36:57.61
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 02 22:36:57.51
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
Middleware: No token found. Redirecting to sign-in page.
May 02 22:35:15.18
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
May 02 22:35:15.14
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
Middleware: No token found. Redirecting to sign-in page.
May 02 22:35:14.80
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
May 02 22:35:14.67
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
Middleware: No token found. Redirecting to sign-in page.
May 02 22:35:14.09
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
[AUTH OPTIONS] Determined session cookie name for NODE_ENV='production': __Secure-next-auth.session-token
May 02 22:35:14.08
GET
200
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/api/auth/signin
2
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
May 02 22:35:13.86
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
Middleware: No token found. Redirecting to sign-in page.
May 02 22:35:13.80
GET
307
load-bxyjd0ogp-photonentangleds-projects.vercel.app
/
5
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



--- MIDDLEWARE EXECUTION START ---
Middleware: Checking auth for protected route: /
Middleware: Incoming cookie names: ["_vercel_jwt","__Host-next-auth.csrf-token","__Secure-next-auth.callback-url","__Secure-next-auth.session-token"]
Middleware: About to call getToken with secret starting: 1QgYsL9nVC... [Length: 43]
Middleware: No token found. Redirecting to sign-in page.