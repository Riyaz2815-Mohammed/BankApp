# BankApp — Next.js Banking Frontend

A banking portal built with Next.js 15, TypeScript, and Tailwind CSS. Authenticates users via Keycloak (OIDC) and consumes the Spring Boot Banking API. Supports three roles with distinct views and permissions.

## Tech Stack

- **Next.js 15** — App Router, TypeScript, server components
- **Tailwind CSS v4** — utility-first styling with CSS variables for theming
- **NextAuth v5 (Auth.js)** — Keycloak OIDC integration, encrypted HttpOnly session cookie
- **Axios** — API client with automatic Bearer token injection
- **Keycloak** — identity provider, RBAC source of truth

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
1. User visits the app → redirected to Keycloak login page
2. User enters credentials → Keycloak issues JWT (contains roles, email, expiry)
3. NextAuth stores tokens in an encrypted HttpOnly session cookie
4. Every API call → Axios interceptor adds: Authorization: Bearer <access_token>
5. Spring Boot validates JWT signature using Keycloak's public key
6. Spring extracts roles and enforces access rules
```

The frontend never stores passwords. The JWT never touches client-side JavaScript — it lives in the HttpOnly cookie and is forwarded server-side.

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
  api.ts                      — Axios instance with JWT interceptor

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

Create a `.env` file in the project root (see `.env.example` in the Spring Boot repo for all variables):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

KEYCLOAK_CLIENT_ID=bankapp-frontend
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_ISSUER=http://localhost:8180/realms/bankapp
KEYCLOAK_INTERNAL_URL=http://keycloak:8080/realms/bankapp

AUTH_TRUST_HOST=true
```

## Running with Docker

```bash
# From the SpringBOOOO/ directory (where docker-compose.yml lives)
docker compose up --build -d
```

Frontend runs on `http://localhost:3000`. Sign in with your Keycloak credentials.

## Backend

Spring Boot API repo: [Banfico-Training](https://github.com/Riyaz2815-Mohammed/Banfico-Training)

Runs on `http://localhost:8080`. All endpoints except `/api/v1/health` and `/api/v1/info` require a valid Keycloak JWT.

## Author

Riyaz
