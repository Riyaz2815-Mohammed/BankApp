# BankApp

A banking portal frontend built with Next.js 15, TypeScript, and Tailwind CSS. Authenticates via Keycloak (OAuth2 / OIDC) and consumes a Spring Boot REST API backend.

## Tech Stack

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS v4** — utility-first styling with custom CSS variables
- **NextAuth v5 (Auth.js)** — Keycloak OAuth2 integration, JWT session
- **Axios** — API client with Bearer token interceptor
- **Keycloak** — Identity provider for authentication and RBAC

## Features

| Page | Description |
|---|---|
| Dashboard | Real-time total balance, account count, customer count |
| Customers | Full CRUD — create, edit, delete customers |
| Accounts | Full CRUD — create, edit, delete accounts |
| Transactions | View by account, create CREDIT / DEBIT transactions |
| Beneficiaries | Add and remove saved beneficiaries per customer |

**RBAC**: Delete actions are restricted to users with the `admin` role from Keycloak. Regular users can only create and edit.

## Project Structure

```
app/
  (public)/login/        — Keycloak sign-in page
  (protected)/           — Auth-gated layout with sidebar and navbar
    dashboard/
    customers/
    accounts/
    transactions/
    beneficiaries/
components/
  layout/Sidebar.tsx     — Navigation sidebar
  layout/Navbar.tsx      — Top bar with user info and sign out
  Providers.tsx          — SessionProvider wrapper
lib/
  auth.ts                — NextAuth config, Keycloak provider, role extraction
  api.ts                 — Axios instance with JWT interceptor
modules/
  customers/             — types, api, components
  accounts/              — types, api, components
  transactions/          — types, api, components
  beneficiaries/         — types, api, components
middleware.ts            — Route protection for all /dashboard, /customers, etc.
```

## Prerequisites

- Node.js 18+
- Keycloak running at `http://localhost:8180` with realm `bankapp`
- Spring Boot API running at `http://localhost:8080`

## Keycloak Setup

1. Realm: `bankapp`
2. Client: `bankapp-frontend` (confidential, standard flow enabled)
3. Redirect URI: `http://localhost:3000/*`
4. Roles: `admin`, `user` (assign to users as needed)

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080

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

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page. Click **Sign In with Keycloak**, authenticate, and land on the dashboard.

## Backend

The Spring Boot API repository: [Banfico-Training](https://github.com/Riyaz2815-Mohammed/Banfico-Training)

It exposes REST endpoints for customers, accounts, transactions, and beneficiaries. All endpoints (except `/api/health` and `/api/info`) require a valid Keycloak JWT. DELETE endpoints require the `ADMIN` role.
