import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import Stripe from 'stripe';

/**
 * POST /api/payments/create-session
 *
 * Creates a real Stripe PaymentIntent and a `Pending` Payment record in the DB.
 * The client receives the PaymentIntent clientSecret to render Stripe Elements.
 * The payment is only marked Completed once the webhook confirms it.
 */
export async function POST(request: Request) {
  try {
    const {
      amount,
      customerName,
      customerEmail,
      customerPhone,
      description,
      paymentMethod,
      eventId,
      eventName,
      donationType,
      poojaDate,
      poojaDay,
      poojaTitle,
      gotram,
      familyMembers,
      specialWishes,
      primaryDevoteeName,
    } = await request.json();

    if (!amount || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Amount, Name and Email are required' },
        { status: 400 }
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('mitra_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid session.' }, { status: 401 });
    }

    const userId = payload.id as string;
    const userRole = payload.role as string | undefined;
    if (userRole === 'Admin') {
      return NextResponse.json({ success: false, error: 'Admin cannot make Donation themselves.' }, { status: 401 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0.5) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least £0.50' },
        { status: 400 }
      );
    }

    // ── Resolve active Stripe Secret Key (DB overrides env) ──────────────────
    let stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    try {
      const settings = await prisma.paymentSettings.findUnique({
        where: { id: 'default' },
      });
      if (
        settings?.stripeSecretKey &&
        !settings.stripeSecretKey.includes('default_key') &&
        !settings.stripeSecretKey.includes('REPLACE_WITH')
      ) {
        stripeSecretKey = settings.stripeSecretKey;
      }
    } catch {
      // DB unavailable — use env var key
    }

    if (!stripeSecretKey || stripeSecretKey.includes('REPLACE_WITH')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Stripe is not configured. Please add your Stripe Secret Key in Admin → Payments → Stripe Account Config.',
        },
        { status: 503 }
      );
    }

    // ── Initialise Stripe with the active secret key ──────────────────────────
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-07-29.dahlia',
    });

    let memberId = userId;
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated.' },
        { status: 401 }
      );
    }

    // ── Create Stripe PaymentIntent ───────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numAmount * 100), // Stripe uses pence
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      description: description || 'MITRA Community Contribution',
      metadata: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        paymentMethod: paymentMethod || 'Stripe Card',
        memberId: memberId || '',
        eventId: eventId || '',
        eventName: eventName || '',
        donationType: donationType || '',
        poojaDate: poojaDate || '',
        poojaDay: poojaDay || '',
        poojaTitle: poojaTitle || '',
        gotram: gotram || '',
        familyMembers: familyMembers || '',
        primaryDevoteeName: primaryDevoteeName || customerName,
        source: 'mitra-website',
      },
      receipt_email: customerEmail,
    });

    // ── Persist a Pending Payment record ─────────────────────────────────────
    try {
      await prisma.payment.create({
        data: {
          amount: numAmount,
          currency: 'GBP',
          status: 'Pending',
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          description: description || 'MITRA Community Contribution',
          paymentMethod: paymentMethod || 'Stripe Card',
          stripePaymentIntentId: paymentIntent.id,
          memberId,
          eventId: eventId || null,
          eventName: eventName || null,
          donationType: donationType ? String(donationType).toLowerCase().trim() : null,
          poojaDate: poojaDate || null,
          poojaDay: poojaDay || null,
          poojaTitle: poojaTitle || null,
          gotram: gotram || null,
          familyMembers: familyMembers || null,
          specialWishes: specialWishes || null,
          primaryDevoteeName: primaryDevoteeName || customerName,
        },
      });
    } catch (dbErr) {
      console.error('Failed to persist pending payment record:', dbErr);
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Payment session creation failed';
    console.error('create-session error:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
