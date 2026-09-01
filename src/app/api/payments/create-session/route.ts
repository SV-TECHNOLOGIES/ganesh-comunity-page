import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { sendPaymentFailureAlert } from '@/lib/email';
import Stripe from 'stripe';

/**
 * POST /api/payments/create-session
 *
 * Creates a real Stripe PaymentIntent and a `Pending` Payment record in the DB.
 * The client receives the PaymentIntent clientSecret to render Stripe Elements.
 * The payment is only marked Completed once the webhook confirms it.
 */
export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    await logger.warn('payments/create-session', 'Invalid JSON body received in create-session');
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

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
  } = body;

  const normalEmail = customerEmail ? String(customerEmail).toLowerCase().trim() : '';
  const safeCustomer = customerName ? String(customerName).trim() : 'Unknown';
  const safeType = donationType ? String(donationType).toLowerCase().trim() : 'general';
  const safeEvent = eventName || eventId || 'London Ganesh Mahotsav 2026';

  if (!amount || !customerName || !customerEmail) {
    await logger.warn('payments/create-session', `Validation failed: Missing required fields for user "${safeCustomer}" <${normalEmail}>`, {
      body,
    });
    return NextResponse.json(
      { success: false, error: 'Amount, Name and Email are required' },
      { status: 400 }
    );
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0.5) {
    await logger.warn('payments/create-session', `Validation failed: Invalid amount £${amount} for user <${normalEmail}>`, {
      amount,
      customerEmail,
    });
    return NextResponse.json(
      { success: false, error: 'Amount must be at least £0.50' },
      { status: 400 }
    );
  }

  try {
    // ── Check Auth Token if present ──────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('mitra_token')?.value;
    let userId: string | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.id) {
        userId = payload.id as string;
      }
    }

    // ── Member ID (standalone string identifier, no foreign key constraint) ──
    const finalMemberId: string | null = (body.memberId as string) || userId || null;

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
    } catch (e) {
      console.warn(`[CONFIG NOTICE] DB PaymentSettings unavailable:`, e);
    }

    if (!stripeSecretKey || stripeSecretKey.includes('REPLACE_WITH')) {
      await logger.error('payments/create-session', `Stripe is not configured for checkout by <${normalEmail}>`);
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

    // ── Create Stripe PaymentIntent ───────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numAmount * 100), // Stripe uses pence
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      description: description || 'MITRA Community Contribution',
      metadata: {
        customerName: safeCustomer,
        customerEmail: normalEmail,
        customerPhone: customerPhone || '',
        paymentMethod: paymentMethod || 'Stripe Card',
        memberId: finalMemberId || '',
        eventId: eventId || '',
        eventName: safeEvent,
        donationType: safeType,
        poojaDate: poojaDate || '',
        poojaDay: poojaDay || '',
        poojaTitle: poojaTitle || '',
        gotram: gotram || '',
        familyMembers: familyMembers || '',
        primaryDevoteeName: primaryDevoteeName || safeCustomer,
        source: 'mitra-website',
      },
      receipt_email: normalEmail,
    });

    // ── Persist a Pending Payment record ─────────────────────────────────────
    try {
      const savedRecord = await prisma.payment.create({
        data: {
          amount: numAmount,
          currency: 'GBP',
          status: 'Pending',
          customerName: safeCustomer,
          customerEmail: normalEmail,
          customerPhone: customerPhone ? String(customerPhone).trim() : null,
          description: description || 'MITRA Community Contribution',
          paymentMethod: paymentMethod || 'Stripe Card',
          stripePaymentIntentId: paymentIntent.id,
          memberId: finalMemberId,
          eventId: eventId || null,
          eventName: safeEvent,
          donationType: safeType,
          poojaDate: poojaDate || null,
          poojaDay: poojaDay || null,
          poojaTitle: poojaTitle || null,
          gotram: gotram ? String(gotram).trim() : null,
          familyMembers: familyMembers ? String(familyMembers).trim() : null,
          specialWishes: specialWishes ? String(specialWishes).trim() : null,
          primaryDevoteeName: (primaryDevoteeName || safeCustomer).trim(),
        },
      });

      await logger.info('payments/create-session', `Checkout session created: £${numAmount} for "${safeCustomer}" <${normalEmail}> (PI: ${paymentIntent.id}, Payment ID: ${savedRecord.id})`, {
        paymentId: savedRecord.id,
        paymentIntentId: paymentIntent.id,
        amount: numAmount,
        customerName: safeCustomer,
        customerEmail: normalEmail,
        donationType: safeType,
        eventName: safeEvent,
      });
    } catch (dbErr: unknown) {
      await logger.error('payments/create-session', `Failed to persist pending payment record for PI ${paymentIntent.id}`, dbErr);
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Payment session creation failed';

    // Log failure and alert REPORT_MAIL
    await logger.paymentFailure('payments/create-session', `Payment session creation failed: ${errorMessage}`, {
      error: errorMessage,
      customerName: safeCustomer,
      customerEmail: normalEmail,
      amount: numAmount,
      cause: safeEvent,
    });

    try {
      await sendPaymentFailureAlert({
        customerName: safeCustomer,
        customerEmail: normalEmail,
        customerPhone: customerPhone ? String(customerPhone) : undefined,
        amount: numAmount,
        currency: 'GBP',
        cause: safeEvent,
        failureReason: errorMessage,
        source: 'Checkout Session Creation (/api/payments/create-session)',
        metadata: body,
      });
    } catch (alertErr) {
      console.error('Failed to dispatch failure email alert during create-session:', alertErr);
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
