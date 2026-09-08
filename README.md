# BankApp — Next.js Banking Frontend

A banking portal built with Next.js 15, TypeScript, and Tailwind CSS. Authenticates users via Keycloak (OIDC) and consumes the Spring Boot Banking API. Supports three roles with distinct views and permissions.

## Tech Stack

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS v4** — utility-first styling with CSS variables for theming
- **NextAuth v5 (Auth.js)** — Keycloak OIDC integration, JWT session management
- **Axios** — API client with automatic Bearer token injection
- **Keycloak** — identity provider, RBAC source of truth

## Roles and Access

| Role | Who | What they see |
|---|---|---|
| `user` | Bank customers | Own accounts, own transactions, transfers, beneficiaries |
| `BankManager` | Bank staff | All accounts, all transactions, all customers, register new users |
| `admin` | Administrators | Everything — including edit and delete |

Role is embedded in the Keycloak JWT and read by NextAuth into the session. All role checks in the UI use `session.roles`.

## Features

### Dashboard
- **Staff (admin / BankManager):** Total bank balance, total accounts, total customers
- **User:** Personal balance, account count

### Customers (`/customers`)
- Staff-only page
- **BankManager + admin:** Register new users (creates Keycloak account + DB customer in one step), view all customers
- **Admin only:** Create DB-only customer, edit, delete (with confirmation dialog)

### Accounts (`/accounts`)
- **Staff:** See all accounts across the bank with customer names; click any account to view full details
- **User:** See only own accounts
- **Admin only:** Create, edit, delete accounts (with confirmation dialog)

### Account Detail (`/accounts/[id]`)
- Staff-only; shows account info, account holder details, and linked beneficiaries

### Transactions (`/transactions`)
- **Staff:** Filter and view transactions across all accounts
- **User:** View transactions on own accounts

### Transfer (`/transfer`)
- User-only; transfer funds between own account and a saved beneficiary

### Beneficiaries (`/beneficiaries`)
- User-only; add and remove saved beneficiaries (with confirmation dialog)

## How Authentication Works

```
1. User visits the app → redirected to Keycloak login page
2. User enters credentials → Keycloak issues JWT (contains roles, userId, expiry)
3. NextAuth stores JWT in session (encrypted cookie)
4. Every API call → Axios interceptor adds: Authorization: Bearer <jwt>
5. Spring Boot validates JWT signature using Keycloak's public key
6. Spring extracts roles and enforces access rules
```

The frontend never stores passwords. Keycloak is the only source of identity.

## Project Structure

```
app/
  (public)/
    login/                    — sign-in page
  (protected)/
    layout.tsx                — auth-gated layout (sidebar + navbar)
    dashboard/page.tsx        — role-based stats
    customers/page.tsx        — customer management + register user
    accounts/page.tsx         — account list (staff: all, user: own)
    accounts/[id]/page.tsx    — account detail with holder + beneficiaries
    transactions/page.tsx     — transaction history
    transfer/page.tsx         — fund transfer (user only)
    beneficiaries/page.tsx    — saved beneficiaries (user only)
  api/auth/[...nextauth]/     — NextAuth route handler

components/
  layout/
    Sidebar.tsx               — role-aware navigation (staffOnly / userOnly items)
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
  transactions/               — types, api calls, components
  beneficiaries/              — types, api calls, BeneficiaryList component

middleware.ts                 — protects all /dashboard, /customers, etc. routes
```

## Prerequisites

- Node.js 18+
- Keycloak running with realm `bankapp`
- Spring Boot API running

## Keycloak Setup

1. Realm: `bankapp`
2. Client: `bankapp-frontend` (confidential, standard flow + direct access grants enabled)
3. Redirect URI: `http://localhost:3000/*`
4. Realm roles: `admin`, `BankManager`, `user`
5. Assign roles to users as needed

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081

KEYCLOAK_CLIENT_ID=bankapp-frontend
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_ISSUER=http://localhost:8180/realms/bankapp

NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirected to login. Sign in with Keycloak credentials and land on the role-appropriate dashboard.

## Running with Docker

```bash
# From the root SpringBOOOO/ directory
docker compose up --build -d
```

Frontend runs on port 3000 inside the container.

## Backend

Spring Boot API: [Banfico-Training](https://github.com/Riyaz2815-Mohammed/Banfico-Training)

Exposes REST endpoints for customers, accounts, transactions, beneficiaries, transfers, and user registration. All endpoints except `/api/health` and `/api/info` require a valid Keycloak JWT.
