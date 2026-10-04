# BankApp — Next.js Banking Frontend

A banking portal built with Next.js 16, TypeScript, and Tailwind CSS. Authenticates users via Keycloak (OIDC) and consumes the Spring Boot Banking API. Supports three roles with distinct views and permissions.

Everything is served behind an **nginx / OpenResty gateway** at `https://localhost` — the frontend, the Keycloak login page (`/auth/*`), and the backend API (`/api/*`) all share one origin. The browser never talks to Next.js, Keycloak, or Spring Boot directly.

## Tech Stack

- **Next.js 16** — App Router, TypeScript, server components
- **Tailwind CSS v4** — utility-first styling with CSS variables for theming
- **NextAuth v5 (Auth.js)** — Keycloak OIDC integration, encrypted HttpOnly session cookie
- **Axios** — API client with automatic Bearer token injection and `ApiResponse<T>` unwrapping
- **Keycloak** — identity provider, RBAC source of truth
- **nginx / OpenResty** — single public entry point; validates the JWT at the edge (Lua) before proxying `/api/*` to Spring Boot

## Roles and Access

| Role | Who | What they see |
|---|---|---|
| `admin` | Administrators | Everything — customers, managers, accounts, payments, transactions |
| `BankManager` | Bank staff | Customers, accounts, transactions, payments — no mutations |
| `user` | Bank customers | Own accounts, transactions, transfers, beneficiaries, profile |

Role is embedded in the Keycloak JWT and read by NextAuth into the session. All role checks in the UI use `session.roles`.

## Pages

### Dashboard (`/dashboard`)
- **Staff:** Total bank balance, total accounts, total customers
- **User:** Personal balance, account count

### Customers (`/customers`) — Staff only
- View all customers with pagination
- **Admin + BankManager:** Register new users (`POST /api/v2/customers` — creates Keycloak account + DB record atomically)
- **Admin only:** Edit customer details, delete customer, create manager account

### Managers (`/managers`) — Admin only
- View all BankManager accounts fetched from Keycloak
- Paginated table: name, username, email, role badge

### Accounts (`/accounts`)
- **Staff:** All accounts across the bank
- **User:** Own accounts only
- **Admin only:** Create, edit, delete accounts

### Transactions (`/transactions`)
- **Staff:** Transactions across any account (select from dropdown)
- **User:** Own account transactions
- Sticky header table with pagination (5 per page)

### Transfer (`/transfer`) — User only
- Idempotent fund transfer — `paymentId` UUID auto-generated in the browser before submission
- Retry with the same `paymentId` returns the cached result, no duplicate transfer

### Beneficiaries (`/beneficiaries`) — User only
- View, add, and remove saved beneficiaries
- Staff can view beneficiaries but cannot add, edit, or delete

### Payments (`/payments`) — Staff only
- All payments across the bank (admin / BankManager)
- Status badge: COMPLETED (green) / FAILED (red) / PENDING (amber)

### Profile (`/profile`) — User only
- View and edit own profile (firstName, lastName, phoneNumber)
- Email and PAN are read-only

## How Authentication Works

```
1. User visits the app → middleware redirects to /login → "Sign In" sends them to
   https://localhost/auth/realms/bankapp/... (nginx proxies /auth/* to Keycloak)
2. User enters credentials → Keycloak redirects back to
   https://localhost/api/auth/callback/keycloak with a one-time auth code
3. NextAuth (server-side) exchanges the code for tokens at the SAME public issuer,
   https://localhost/auth/realms/bankapp. The container's /etc/hosts remaps
   localhost → the gateway IP, so this backchannel call is routed THROUGH nginx.
4. NextAuth stores access/id/refresh tokens + roles in an encrypted HttpOnly cookie
5. Every API call → Axios interceptor adds: Authorization: Bearer <access_token>
6. nginx validates the JWT signature (RS256, Keycloak public key, Lua) and injects
   X-User-Roles / X-User-Email / X-User-Sub headers before proxying to Spring Boot
7. Spring Boot trusts those headers and enforces role-based access — it never parses
   the JWT itself
```

The frontend never stores passwords. Keycloak and Spring Boot are never reached directly — all traffic, including the server-side token exchange, flows through the nginx gateway so the issuer (`https://localhost/auth/realms/bankapp`) matches everywhere and the JWT `iss` claim lines up.

> **Note:** the access token is readable client-side via the NextAuth session (`session.accessToken`) — that's how the Axios interceptor attaches `Authorization: Bearer <token>`. The token travels over HTTPS; the session cookie itself is HttpOnly.

## Project Structure

```
app/
  (public)/
    login/                    — sign-in page
  (protected)/
    layout.tsx                — auth-gated layout (sidebar + navbar)
    dashboard/page.tsx        — role-based stats
    customers/page.tsx        — customer management (staff only)
    managers/page.tsx         — manager list (admin only)
    accounts/page.tsx         — account list (staff: all, user: own)
    accounts/[id]/page.tsx    — account detail with holder + beneficiaries
    transactions/page.tsx     — transaction history
    transfer/page.tsx         — fund transfer (user only)
    beneficiaries/page.tsx    — saved beneficiaries (user only)
    payments/page.tsx         — payment log (staff only)
    profile/page.tsx          — own profile edit (user only)
  api/auth/[...nextauth]/     — NextAuth route handler

components/
  layout/
    Sidebar.tsx               — role-aware navigation (staffOnly / userOnly / adminOnly)
    Navbar.tsx                — top bar with user info and sign out
  ui/
    ConfirmDialog.tsx         — reusable confirmation modal for destructive actions
  Providers.tsx               — SessionProvider wrapper

lib/
  auth.ts                     — NextAuth config, Keycloak provider, role extraction
  api.ts                      — Axios instance: Bearer injection + ApiResponse<T>
                                unwrap + auto sign-out on 401/403

docker-entrypoint.sh          — patches /etc/hosts (localhost → gateway IP) so the
                                server-side OIDC backchannel is routed through nginx,
                                then starts the Next.js server

modules/
  customers/                  — types, api calls, components
  accounts/                   — types, api calls, components
  transactions/               — types, api calls, TransactionList component
  beneficiaries/              — types, api calls, BeneficiaryList component
  payments/                   — types, api calls
  profile/                    — types, api calls

middleware.ts                 — protects all authenticated routes
```

## Environment Variables

Copy `.env.example` to `.env`. Everything resolves to `https://localhost` (the nginx gateway) — there are no raw service ports in the browser-facing config.

```env
# Build args (baked into the client bundle)
NEXT_PUBLIC_API_URL=https://localhost
NEXT_PUBLIC_KEYCLOAK_ISSUER=https://localhost/auth/realms/bankapp
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=bankapp-frontend
NEXT_PUBLIC_NEXTAUTH_URL=https://localhost

# Server-side runtime
NEXTAUTH_URL=https://localhost
NEXTAUTH_SECRET=change-this-to-any-long-random-string   # also passed as AUTH_SECRET
KEYCLOAK_CLIENT_ID=bankapp-frontend
KEYCLOAK_CLIENT_SECRET=get-this-from-keycloak-admin-console
KEYCLOAK_ISSUER=https://localhost/auth/realms/bankapp
AUTH_TRUST_HOST=true
NODE_ENV=development
```

In `docker-compose.yml` the Next.js container also gets `NODE_EXTRA_CA_CERTS=/app/certs/localhost.crt` so Node trusts the gateway's self-signed TLS cert on the server-side OIDC backchannel.

## Running with Docker

```bash
# From the SpringBOOOO/ directory (where docker-compose.yml lives) — brings up the
# whole stack: gateway, nextjs, keycloak, spring-boot, postgres
docker compose up --build -d
```

The app is served at **https://localhost** (accept the self-signed cert warning). Next.js itself runs internally on `:3000` and is never exposed to the host — only nginx is (`80`, `443`). Sign in with your Keycloak credentials.

> When you change `BankApp/conf`-level files that are baked into images (e.g. the gateway config), rebuild that service: `docker compose up --build -d gateway`.

## Backend

Spring Boot API repo: [Banfico-Training](https://github.com/Riyaz2815-Mohammed/Banfico-Training)

Reached at `https://localhost/api/*` through the gateway. nginx validates the Keycloak JWT and injects `X-User-Roles` before proxying to Spring Boot (internal `:8080`). All endpoints except `/api/v1/health` and `/api/v1/info` require a valid JWT.

## Author

Riyaz
