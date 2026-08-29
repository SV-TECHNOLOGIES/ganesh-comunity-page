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

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0.5) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least £0.50' },
        { status: 400 }
      );
    }

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

    // ── Resolve valid Member ID (strictly preventing foreign key violation) ──
    let validMemberId: string | null = null;

    if (userId) {
      const existingMemberById = await prisma.member
        .findUnique({
          where: { id: userId },
        })
        .catch(() => null);

      if (existingMemberById) {
        validMemberId = existingMemberById.id;
      }
    }

    // Fallback: If not found by ID, look up by customerEmail in Member table
    if (!validMemberId && customerEmail) {
      const normalEmail = customerEmail.toLowerCase().trim();
      const existingMemberByEmail = await prisma.member
        .findUnique({
          where: { email: normalEmail },
        })
        .catch(() => null);

      if (existingMemberByEmail) {
        validMemberId = existingMemberByEmail.id;
      } else {
        // Automatically create a Member record for the devotee so their profile is saved
        try {
          const newMember = await prisma.member.create({
            data: {
              fullName: (primaryDevoteeName || customerName).trim(),
              email: normalEmail,
              phone: customerPhone ? customerPhone.trim() : '',
              tier: 'Annual Member',
              status: 'Active',
              role: 'Member',
              startDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          });
          validMemberId = newMember.id;
        } catch (memErr) {
          console.warn('[create-session] Could not create member record, leaving memberId null:', memErr);
          validMemberId = null;
        }
      }
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
        memberId: validMemberId || '',
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
          memberId: validMemberId, // Guaranteed to exist in Member table or be null
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
      console.error('[create-session] Failed to persist pending payment record:', dbErr);
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Payment session creation failed';
    console.error('[create-session] error:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
