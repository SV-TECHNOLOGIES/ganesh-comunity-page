import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PATHS_TO_REVALIDATE = [
  '/',
  '/events',
  '/media',
  '/sponsors',
  '/telugu-business',
  '/leadership',
  '/membership',
  '/about',
  '/charity',
  '/contact',
  '/donate',
  '/admin',
  '/api/events',
  '/api/events/rsvp',
  '/api/events/hero-config',
  '/api/config/preferences',
  '/api/media',
  '/api/media/image-optimize',
  '/api/media/download',
  '/api/media/cache-album',
  '/api/sponsors',
  '/api/sponsors/inquiry',
  '/api/telugu-business',
  '/api/leadership',
  '/api/settings',
  '/api/contact',
  '/api/email-queue',
  '/api/upload',
  '/api/payments/booking-counts',
  '/api/payments/get-publishable-key',
  '/api/payments/create-session',
  '/api/user/rsvps',
  '/api/user/donations',
  '/api/admin/settings',
  '/api/admin/payments',
  '/api/admin/payment-settings',
  '/api/admin/dashboard-analytics',
  '/api/admin/telugu-business',
  '/api/admin/event-hero-config',
  '/api/admin/charity-cases',
  '/api/admin/sponsors',
  '/api/admin/sponsors/reorder',
  '/api/admin/rsvps',
  '/api/admin/logs',
  '/api/admin/members',
  '/api/admin/leadership',
  '/api/admin/events',
  '/api/admin/featured-media',
  '/api/admin/media',
];

export async function POST(req: Request) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin access required.' },
      { status: 401 }
    );
  }

  try {
    // Revalidate entire application tree (pages, layouts, and route handlers)
    revalidatePath('/', 'layout');

    for (const p of PATHS_TO_REVALIDATE) {
      try {
        revalidatePath(p);
        revalidatePath(p, 'layout');
      } catch {
        // Ignore individual path errors
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cache cleared and all APIs & pages revalidated successfully.',
        revalidatedCount: PATHS_TO_REVALIDATE.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.error('[CLEAR CACHE ERROR]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

