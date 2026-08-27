import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments/get-publishable-key
 *
 * Returns the active Stripe Publishable Key for the frontend to initialise
 * Stripe.js.  Priority order:
 *   1. PaymentSettings DB record (admin-configurable via /admin/payments settings tab)
 *   2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var
 *   3. Fallback empty string (Stripe will not work — user must configure a key)
 */
export async function GET() {
  try {
    // Attempt to read admin-configured key from database
    let publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

    try {
      const settings = await prisma.paymentSettings.findUnique({
        where: { id: 'default' },
      });
      if (
        settings?.stripePublishableKey &&
        !settings.stripePublishableKey.includes('default_key') &&
        !settings.stripePublishableKey.includes('REPLACE_WITH')
      ) {
        publishableKey = settings.stripePublishableKey;
      }
    } catch {
      // DB unavailable — fall through to env var
    }

    return NextResponse.json({ success: true, publishableKey });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve publishable key';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
