import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register'];
const AUTH_PATHS = ['/login', '/register'];

// Mirrors ROLE_HOME from lib/constants.ts.
// Duplicated here because Edge middleware cannot import from src/ modules.
const ROLE_HOME: Record<string, string> = {
  ADMIN: '/dashboard',
  BORROWER: '/borrower/profile',
  SALES: '/dashboard/sales',
  SANCTION: '/dashboard/sanction',
  DISBURSEMENT: '/dashboard/disbursement',
  COLLECTION: '/dashboard/collection',
};

// Which roles are allowed to access each protected path prefix.
// Checked as startsWith so /dashboard/sales covers all sub-paths.
// ADMIN is allowed everywhere — checked separately below.
const ROUTE_ROLES: { prefix: string; allowed: string[] }[] = [
  { prefix: '/dashboard/sales',        allowed: ['SALES'] },
  { prefix: '/dashboard/sanction',     allowed: ['SANCTION'] },
  { prefix: '/dashboard/disbursement', allowed: ['DISBURSEMENT'] },
  { prefix: '/dashboard/collection',   allowed: ['COLLECTION'] },
  { prefix: '/borrower',               allowed: ['BORROWER'] },
];

/**
 * Decodes the role from a JWT without verifying the signature.
 * Also checks the exp claim so stale cookies don't cause redirect loops.
 * Signature verification still happens on every backend API call.
 */
function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) return null;
    return typeof decoded?.role === 'string' ? decoded.role : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('lms_token')?.value;

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isAuthPage = AUTH_PATHS.includes(pathname);

  // ── 1. Unauthenticated users can only visit public paths ──────────────────
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (!token) return NextResponse.next();

  const role = getRoleFromToken(token);

  // Token is present but expired or malformed — treat as unauthenticated.
  if (!role) {
    if (!isPublic) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  // ── 2. Authenticated users on login/register → their home ─────────────────
  if (isAuthPage) {
    const home = ROLE_HOME[role] ?? '/dashboard';
    return NextResponse.redirect(new URL(home, request.url));
  }

  // ADMIN can access everything — skip further checks.
  if (role === 'ADMIN') return NextResponse.next();

  // ── 3. /dashboard (stats overview) is ADMIN-only ──────────────────────────
  if (pathname === '/dashboard') {
    const home = (role && ROLE_HOME[role]) ?? '/login';
    return NextResponse.redirect(new URL(home, request.url));
  }

  // ── 4. Role-based route protection for all dashboard modules ──────────────
  // If the user's role is not in the allowed list for the route they are
  // visiting, redirect them to their own home. The backend independently
  // returns 403 for API calls — this is a UX-layer guard that prevents
  // rendering the page at all.
  const match = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  if (match && role && !match.allowed.includes(role)) {
    const home = ROLE_HOME[role] ?? '/login';
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
