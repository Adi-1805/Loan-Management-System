# Loan Management System (LMS)

Production-quality MVP for end-to-end loan lifecycle management: borrower onboarding, Business Rule Engine (BRE), role-based operations dashboards, and collection.

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 15, TypeScript, Tailwind, React Hook Form, Zod, Axios |
| Backend | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, multer |

## Project Structure

```
/frontend   → Next.js App Router UI
/backend    → Express REST API
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Seed Users

All passwords: `Password@123`

| Email | Role |
|-------|------|
| admin@example.com | ADMIN |
| sales@example.com | SALES |
| sanction@example.com | SANCTION |
| disbursement@example.com | DISBURSEMENT |
| collection@example.com | COLLECTION |
| borrower@example.com | BORROWER |

## Loan Lifecycle

```
APPLIED → SANCTIONED → DISBURSED → CLOSED
         ↘ REJECTED
```

## Borrower Flow

1. Register / Login
2. Personal details → BRE validation (`POST /api/borrower/bre` and `/profile`)
3. Upload salary slip (PDF/JPG/PNG, max 5MB)
4. Configure loan (₹50k–₹5L, 30–365 days, 12% p.a.) → status `APPLIED`

## BRE Rules (server-side source of truth)

- Age 23–50
- Salary ≥ ₹25,000
- Not unemployed
- Valid PAN: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`

## API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Borrower | `POST /api/borrower/profile`, `POST /api/borrower/bre`, `POST /api/borrower/upload`, `POST /api/borrower/apply` |
| Loans | `GET /api/loans`, `GET /api/loans/:id` |
| Sanction | `PATCH /api/sanction/:loanId/approve`, `PATCH /api/sanction/:loanId/reject` |
| Disbursement | `PATCH /api/disbursement/:loanId` |
| Collection | `POST /api/collection/:loanId/payment` |
| Dashboard | `GET /api/dashboard/sales`, `sanction`, `disbursement`, `collection`, `stats` |

## Architecture (Interview Talking Points)

**Backend (layered)**

- `routes` → HTTP + RBAC
- `controllers` → request/response
- `services` → business logic (BRE, loan lifecycle, payments)
- `models` → Mongoose schemas
- `middleware` → JWT auth, role authorization, validation, file upload

**Frontend**

- `services/` → Axios API client with JWT interceptor
- `hooks/useAuth` → login state + refresh from `/auth/me`
- `middleware.ts` → route protection via cookie
- Role-based sidebar hides inaccessible modules (backend enforces 401/403)

## Environment Variables

**backend/.env**

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | both | Development server |
| `npm run build` | both | Production build |
| `npm run seed` | backend | Seed demo users |

## Demo Walkthrough

1. Login as `borrower@example.com` → complete profile, upload, apply.
2. Login as `sanction@example.com` → approve loan.
3. Login as `disbursement@example.com` → mark disbursed.
4. Login as `collection@example.com` → record payment until outstanding = 0 → auto `CLOSED`.
5. Login as `admin@example.com` → view all modules and stats.
