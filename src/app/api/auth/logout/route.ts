import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear auth cookies
  response.cookies.set('mitra_token', '', { path: '/', maxAge: 0 });
  response.cookies.set('mitra_member_session', '', { path: '/', maxAge: 0 });
  response.cookies.set('mitra_session', '', { path: '/', maxAge: 0 });

  return response;
}
