# Loan Management System (LMS)

A full-stack lending platform that covers the complete loan lifecycle — from borrower application and BRE eligibility check, through sanction and disbursement, to repayment collection. Built with Next.js 15, Express, TypeScript, and MongoDB.

**Live Demo**
- Frontend: [https://loan-management-system-frontend-85u9rvzog-adi-1805s-projects.vercel.app/](https://loan-management-system-frontend-85u9rvzog-adi-1805s-projects.vercel.app/)
- Backend API: [https://lms-backend-zfix.onrender.com/api/health](https://lms-backend-zfix.onrender.com/api/health)
- Demo Video: https://youtu.be/eCasSwXJSfw
---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Roles & Permissions](#roles--permissions)
- [Loan Lifecycle](#loan-lifecycle)
- [Business Rule Engine (BRE)](#business-rule-engine-bre)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [Seed Data](#seed-data)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Features

- **JWT Authentication** — secure login with role-encoded tokens; no session storage on the server
- **Role-Based Access Control (RBAC)** — six distinct roles, enforced at both the API layer (Express middleware) and the UI layer (Next.js Edge Middleware)
- **Business Rule Engine (BRE)** — pre-validates borrower eligibility before a loan application is submitted
- **Full Loan Lifecycle** — Lead → Sanctioned/Rejected → Disbursed → Closed/Defaulted
- **Payment Recording** — collection officers record repayments with UTR numbers; outstanding balance auto-updates
- **Role-specific Dashboards** — each role sees only the data and actions relevant to their function
- **File Upload** — borrowers upload salary slips (stored locally via Multer)
- **Simple Interest Calculation** — loan cost computed as `P × R × T / 100` at application time
- **Input Validation** — Zod schemas on both frontend (react-hook-form) and backend (middleware)
- **Admin Stats Overview** — aggregate counts and amounts across all loan stages

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Database | MongoDB via Mongoose 8 |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | bcrypt |
| File Upload | Multer |
| Validation | Zod |
| Build | `tsc` → `node dist/app.js` |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Auth Storage | js-cookie (`lms_token`) |
| Route Guards | Next.js Edge Middleware |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Next.js)                  │
│                                                      │
│  Edge Middleware → RBAC route guard (no backend call)│
│  Pages / Components → Axios → Backend API            │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│              Express API  (Render)                   │
│                                                      │
│  /api/auth      → JWT issue / verify                 │
│  /api/borrower  → Profile, BRE, Upload, Apply        │
│  /api/loans     → List / detail (all roles)          │
│  /api/sanction  → Approve / Reject                   │
│  /api/disbursement → Disburse                        │
│  /api/collection   → Record payment                  │
│  /api/dashboard    → Role-scoped stats               │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              MongoDB Atlas (free M0)                 │
│   Collections: users, loans, borrowerprofiles,       │
│                payments                              │
└─────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

| Role | Description | Accessible Routes |
|------|-------------|-------------------|
| `ADMIN` | Full access to everything | All routes + `/dashboard` stats |
| `SALES` | Views incoming loan leads | `/dashboard/sales` |
| `SANCTION` | Approves or rejects loans | `/dashboard/sanction`, `/api/sanction` |
| `DISBURSEMENT` | Disburses sanctioned loans | `/dashboard/disbursement`, `/api/disbursement` |
| `COLLECTION` | Records repayment payments | `/dashboard/collection`, `/api/collection` |
| `BORROWER` | Applies for loans, views own status | `/borrower/*` |

Role is embedded in the JWT payload and verified by Express middleware on every protected request. The Next.js Edge Middleware independently decodes the role (without verifying the signature) to redirect users away from pages they cannot access — preventing a flash of unauthorized UI.

---

## Loan Lifecycle

```
LEAD  ──►  APPROVED  ──►  DISBURSED  ──►  CLOSED
  │              │                            ▲
  └──►  REJECTED └──►  REJECTED           (fully repaid)
                                            
                                         DEFAULTED
                                         (outstanding + overdue)
```

| Status | Triggered by | Description |
|--------|-------------|-------------|
| `LEAD` | Borrower applies | Application submitted, pending review |
| `APPROVED` | Sanction officer | Loan sanctioned; awaiting funds release |
| `REJECTED` | Sanction officer | Loan declined with a reason |
| `DISBURSED` | Disbursement officer | Funds released to borrower |
| `CLOSED` | System (on full repayment) | Outstanding balance reaches zero |
| `DEFAULTED` | System | Marked overdue by collection |

---

## Business Rule Engine (BRE)

Before a borrower submits a loan application they must pass the BRE check. Rules evaluated:

| Rule | Condition |
|------|-----------|
| **Age** | Must be 22–58 years old at time of application |
| **Salary** | Monthly salary ≥ ₹25,000 |
| **Employment Mode** | Must be `full-time` or `part-time` (not `self-employed`) |
| **PAN** | Must match format `[A-Z]{5}[0-9]{4}[A-Z]` |

All four rules must pass. If any fail, the specific errors are returned and the borrower cannot proceed to apply.

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require the header:
```
Cookie: lms_token=<jwt>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register a new BORROWER account |
| `POST` | `/auth/login` | No | Login; sets `lms_token` cookie |
| `GET` | `/auth/me` | Yes | Returns current user info |

**Register body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password@123" }
```

**Login body:**
```json
{ "email": "jane@example.com", "password": "Password@123" }
```

---

### Borrower (`BORROWER` role only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/borrower/profile` | Fetch own profile |
| `POST` | `/borrower/profile` | Create / update profile |
| `POST` | `/borrower/bre` | Run BRE eligibility check |
| `POST` | `/borrower/upload` | Upload salary slip (multipart, field: `salarySlip`) |
| `POST` | `/borrower/apply` | Submit loan application |
| `GET` | `/borrower/loans` | List own loan applications |

**Apply loan body:**
```json
{
  "principalAmount": 100000,
  "tenureDays": 90
}
```
Constraints: amount ₹50,000–₹5,00,000 · tenure 30–365 days · interest rate 12% p.a. (simple interest)

---

### Loans (all authenticated roles)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/loans` | List all loans (filterable by status) |
| `GET` | `/loans/:id` | Get single loan detail |

---

### Sanction (`SANCTION` or `ADMIN`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/sanction/:loanId/approve` | Approve a LEAD loan |
| `PATCH` | `/sanction/:loanId/reject` | Reject a LEAD loan |

**Reject body:**
```json
{ "reason": "Insufficient income documentation" }
```

---

### Disbursement (`DISBURSEMENT` or `ADMIN`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/disbursement/:loanId` | Disburse an APPROVED loan |

---

### Collection (`COLLECTION` or `ADMIN`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/collection/:loanId/payment` | Record a repayment |
| `GET` | `/collection/:loanId/payments` | List all payments for a loan |

**Payment body:**
```json
{
  "utrNumber": "UTR123456789",
  "amount": 15000,
  "paymentDate": "2025-06-01"
}
```

---

### Dashboard

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard/stats` | `ADMIN` | Aggregate counts across all stages |
| `GET` | `/dashboard/sales` | `SALES`, `ADMIN` | All LEAD applications |
| `GET` | `/dashboard/sanction` | `SANCTION`, `ADMIN` | Loans pending sanction |
| `GET` | `/dashboard/disbursement` | `DISBURSEMENT`, `ADMIN` | Approved loans pending disbursement |
| `GET` | `/dashboard/collection` | `COLLECTION`, `ADMIN` | Disbursed loans + payment history |

---

## Project Structure

```
.
├── render.yaml                    # Render deployment config
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app entry point
│   │   ├── config/
│   │   │   ├── db.ts              # Mongoose connection
│   │   │   └── env.ts             # Typed env vars
│   │   ├── controllers/           # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── borrower.controller.ts
│   │   │   ├── collection.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── loan.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT verify + role authorize
│   │   │   ├── errorHandler.ts    # Global error handler
│   │   │   ├── upload.ts          # Multer config
│   │   │   └── validate.ts        # Zod schema validation
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Loan.ts
│   │   │   ├── BorrowerProfile.ts
│   │   │   └── Payment.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── borrower.routes.ts
│   │   │   ├── loan.routes.ts
│   │   │   ├── sanction.routes.ts
│   │   │   ├── disbursement.routes.ts
│   │   │   ├── collection.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   ├── services/              # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── borrower.service.ts
│   │   │   ├── bre.service.ts
│   │   │   ├── collection.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── loan.service.ts
│   │   ├── seed/
│   │   │   └── index.ts           # Seed script for demo users
│   │   ├── types/
│   │   │   └── index.ts           # Shared enums (Role, LoanStatus, etc.)
│   │   ├── utils/
│   │   │   ├── apiResponse.ts     # sendSuccess / sendError helpers
│   │   │   ├── age.ts
│   │   │   ├── jwt.ts
│   │   │   └── loanCalculator.ts  # Simple interest computation
│   │   └── validations/
│   │       ├── auth.validation.ts
│   │       └── borrower.validation.ts
│   ├── uploads/                   # Local salary slip storage
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js App Router pages
    │   │   ├── page.tsx           # Landing page
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── borrower/
    │   │   │   ├── profile/page.tsx
    │   │   │   ├── apply/page.tsx
    │   │   │   └── upload/page.tsx
    │   │   └── dashboard/
    │   │       ├── page.tsx       # Admin stats
    │   │       ├── sales/page.tsx
    │   │       ├── sanction/page.tsx
    │   │       ├── disbursement/page.tsx
    │   │       └── collection/page.tsx
    │   ├── components/
    │   │   ├── layout/            # DashboardLayout, Navbar, Sidebar
    │   │   └── ui/                # Button, Card, Input, Loading, Select
    │   ├── hooks/
    │   │   └── useAuth.ts
    │   ├── lib/
    │   │   ├── constants.ts       # ROLE_HOME map, API paths
    │   │   ├── loanCalculator.ts  # Frontend interest preview
    │   │   └── validations.ts     # Zod schemas for forms
    │   ├── services/              # Axios API wrappers
    │   ├── store/
    │   │   └── auth.store.ts      # Auth state (zustand / context)
    │   ├── types/index.ts
    │   └── middleware.ts          # Next.js Edge Middleware (RBAC routing)
    ├── vercel.json                # Framework preset for Vercel
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## Getting Started (Local)

### Prerequisites

- Node.js 20+
- MongoDB running locally **or** a MongoDB Atlas URI

### 1. Clone the repo

```bash
git clone https://github.com/Adi-1805/Loan-Management-System.git
cd "Loan-Management-System"
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000`. Visit `http://localhost:5000/api/health` to verify.

### 3. Set up the frontend

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 4. Seed demo users

```bash
cd backend
npm run seed
```

---

## Seed Data

The seed script creates one user per role, all with the password `Password@123`:

| Email | Role |
|-------|------|
| `admin@example.com` | ADMIN |
| `sales@example.com` | SALES |
| `sanction@example.com` | SANCTION |
| `disbursement@example.com` | DISBURSEMENT |
| `collection@example.com` | COLLECTION |
| `borrower@example.com` | BORROWER |

These accounts are also shown on the landing page of the deployed app.

---

## Deployment

### Backend → Render

The `render.yaml` at the repo root configures the service automatically.

1. Go to [render.com](https://render.com) → **New → Blueprint** → connect this repo
2. Set the following environment variables in the Render dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your Vercel frontend URL |

3. Deploy. Health check endpoint: `/api/health`

> **Note:** The free Render plan spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<your-render-service>.onrender.com/api` |

4. Deploy. Vercel auto-detects Next.js.

### Database → MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user under **Database Access**
3. Under **Network Access** → allow `0.0.0.0/0`
4. Copy the connection string (replace `<password>` and set database name to `lms`)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Port the server listens on |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration |
| `CLIENT_URL` | Yes | — | Allowed CORS origin (frontend URL) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API (include `/api`) |
