# Routing and Auth

## 1. Routing Model

Routing is file-based via TanStack Router.

- Source routes: `src/routes/*`
- Generated tree: `src/routeTree.gen.ts`
- Router initialization: `src/router.tsx`

`src/routeTree.gen.ts` should be treated as generated output only.

## 2. Route Map

| URL Path | Route File | Behavior |
| --- | --- | --- |
| `/` | `src/routes/_public/index.tsx` | Public landing page (`LandingPage`) |
| `/connect` | `src/routes/connect.tsx` | Main dashboard (`Dashboard`) |
| `/sign-in` | `src/routes/_auth/sign-in.tsx` | Sign-in form |
| `/sign-up` | `src/routes/_auth/sign-up.tsx` | Sign-up form |
| `/forgot-password` | `src/routes/_auth/forgot-password.tsx` | Password recovery request |
| `/reset-password` | `src/routes/_auth/reset-password.tsx` | Password reset form using URL token |
| `/sign-out` | `src/routes/_auth/sign-out.tsx` | Server-side sign-out then redirect |
| `/example-protected-route` | `src/routes/_protected/example-protected-route.tsx` | Protected sample route |
| `/hello` | `src/routes/_api/hello.tsx` | Simple API text response |
| `/og` | `src/routes/_api/og.tsx` | Dynamic Open Graph image endpoint |

## 3. Layout and Guard Files

### `src/routes/__root.tsx`

- Global root route and shell.
- Loader returns:
  - `currentUser` from `authMiddleware()`
  - `baseUrl` from `getBaseUrl()`
- Adds meta tags and OG tags.
- Provides `ThemeProvider` and `Toaster`.
- Uses `NotFound` as not-found component.

### `src/routes/_public.tsx`

- Public loader that still reads `currentUser` from `authMiddleware()`.
- No redirect logic.

### `src/routes/_protected.tsx`

- Requires `currentUser`.
- Redirects unauthenticated users to `/sign-in` with `redirect` search param.

### `src/routes/_auth.tsx`

- For anonymous-only pages.
- Redirects authenticated users away from auth screens to `/`.
- Exception: `/sign-out` remains accessible for logged-in sign-out flow.

## 4. Auth Flow Implementation

Auth server logic is in `src/server/functions/auth.ts`.

## 4.1 Session Model

- Cookie name: `session-token`
- Cookie flags:
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: 'lax'`
  - `maxAge: 30 days`
- Storage is in-memory (`Map` objects), not persistent.

## 4.2 Users and Tokens

In-memory maps:

- `usersById`
- `usersByEmail`
- `sessionTokens`
- `resetTokens` (with TTL)

Reset token TTL is 15 minutes.

## 4.3 Server Functions

- `signUpFn` (POST)
  - Validates email/password
  - Rejects duplicate email
  - Creates user + session cookie
  - Redirects to `redirect` param or `/`
- `signInFn` (POST)
  - Validates credentials
  - Creates session cookie
  - Redirects to `redirect` param or `/`
- `signOutFn` (GET)
  - Removes session token mapping and deletes cookie
- `getCurrentUser` (GET)
  - Reads cookie -> token -> user
- `authMiddleware` (GET)
  - Returns `{ currentUser }`
- `forgotPasswordFn` (POST)
  - Generates reset token if account exists
  - Logs reset URL to console
- `resetPasswordFn` (POST)
  - Validates userId + secret + TTL
  - Updates password

## 5. Auth UI Routes

- Sign in (`src/routes/_auth/sign-in.tsx`)
  - Uses `react-hook-form` + Zod
  - Uses TanStack Query mutation with `useServerFn(signInFn)`
- Sign up (`src/routes/_auth/sign-up.tsx`)
  - Similar pattern with `signUpFn`
- Forgot password (`src/routes/_auth/forgot-password.tsx`)
  - Calls `forgotPasswordFn` and displays success alert
- Reset password (`src/routes/_auth/reset-password.tsx`)
  - Requires `userId` and `secret` in query params
  - Calls `resetPasswordFn` and redirects to sign-in on success
- Sign out (`src/routes/_auth/sign-out.tsx`)
  - Calls `signOutFn` in loader and redirects to `/`

## 6. Hook Access

`src/hooks/use-auth.ts` provides:

- `currentUser` (from root loader data)
- `signOut()` (calls server function + invalidates router)

## 7. Operational Notes

- Current auth is suitable for local/dev or demos.
- Production deployment should replace in-memory maps with persistent storage and proper password hashing.
