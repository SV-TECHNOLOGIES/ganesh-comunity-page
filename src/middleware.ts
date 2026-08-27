import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Simple JWT payload decode (no signature verify — just for routing) ──────
// Full cryptographic verification still happens in API routes via jsonwebtoken.
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isMemberRoute =
    pathname === '/membership/portal' || pathname.startsWith('/membership/portal/');

  if (!isAdminRoute && !isMemberRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('ukta_token')?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  // Not authenticated at all → redirect to login
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated as Member but trying admin route → redirect to login
  if (isAdminRoute && payload.role !== 'Admin') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'admin_required');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/membership/portal',
    '/membership/portal/:path*',
  ],
};
