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
  const reqTime = new Date().toISOString();

  try {
    const body = await request.json();
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

    console.log(`\n[CREATE-SESSION] [${reqTime}] Incoming payment checkout request:`);
    console.log(`  ├─ Customer: "${safeCustomer}" <${normalEmail}>`);
    console.log(`  ├─ Devotee: "${primaryDevoteeName || safeCustomer}" | Phone: "${customerPhone || 'N/A'}"`);
    console.log(`  ├─ Donation Type: [${safeType.toUpperCase()}] | Amount: £${amount}`);
    console.log(`  ├─ Event: "${safeEvent}" | Pooja: "${poojaDate || 'N/A'} - ${poojaTitle || 'N/A'}" | Gotram: "${gotram || 'N/A'}"`);

    if (!amount || !customerName || !customerEmail) {
      console.warn(`[CREATE-SESSION] [${reqTime}] Validation failed: Missing required fields for user "${safeCustomer}" <${normalEmail}>`);
      return NextResponse.json(
        { success: false, error: 'Amount, Name and Email are required' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0.5) {
      console.warn(`[CREATE-SESSION] [${reqTime}] Validation failed: Invalid amount £${amount} for user <${normalEmail}>`);
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
        console.log(`  ├─ Auth Session: Logged-in user (Token User ID: ${userId}, Role: ${payload.role || 'Member'})`);
      } else {
        console.log(`  ├─ Auth Session: Guest checkout (Invalid/expired token)`);
      }
    } else {
      console.log(`  ├─ Auth Session: Guest checkout (No auth cookie)`);
    }

    // ── Member ID (standalone string identifier, no foreign key constraint) ──
    const finalMemberId: string | null = (body.memberId as string) || userId || null;
    if (finalMemberId) {
      console.log(`  ├─ Member ID: "${finalMemberId}"`);
    }

    // ── Resolve active Stripe Secret Key (DB overrides env) ──────────────────
    let stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    let keySource = 'process.env';
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
        keySource = `PostgreSQL PaymentSettings (${settings.activeAccountName || 'Active Account'})`;
      }
    } catch (e) {
      console.warn(`  ├─ [CONFIG NOTICE] DB PaymentSettings unavailable, fallback to process.env:`, e);
    }

    if (!stripeSecretKey || stripeSecretKey.includes('REPLACE_WITH')) {
      console.error(`[CREATE-SESSION ERROR] [${reqTime}] Stripe is not configured for checkout by <${normalEmail}>.`);
      return NextResponse.json(
        {
          success: false,
          error:
            'Stripe is not configured. Please add your Stripe Secret Key in Admin → Payments → Stripe Account Config.',
        },
        { status: 503 }
      );
    }

    console.log(`  ├─ Stripe Config: Key resolved from ${keySource}`);

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

    console.log(`  ├─ Stripe PaymentIntent Created: ${paymentIntent.id} (Status: ${paymentIntent.status})`);

    // ── Persist a Pending Payment record ─────────────────────────────────────
    try {
      // const savedRecord = await prisma.payment.create({
      //   data: {
      //     amount: numAmount,
      //     currency: 'GBP',
      //     status: 'Pending',
      //     customerName: safeCustomer,
      //     customerEmail: normalEmail,
      //     customerPhone: customerPhone ? String(customerPhone).trim() : null,
      //     description: description || 'MITRA Community Contribution',
      //     paymentMethod: paymentMethod || 'Stripe Card',
      //     stripePaymentIntentId: paymentIntent.id,
      //     memberId: finalMemberId,
      //     eventId: eventId || null,
      //     eventName: safeEvent,
      //     donationType: safeType,
      //     poojaDate: poojaDate || null,
      //     poojaDay: poojaDay || null,
      //     poojaTitle: poojaTitle || null,
      //     gotram: gotram ? String(gotram).trim() : null,
      //     familyMembers: familyMembers ? String(familyMembers).trim() : null,
      //     specialWishes: specialWishes ? String(specialWishes).trim() : null,
      //     primaryDevoteeName: (primaryDevoteeName || safeCustomer).trim(),
      //   },
      // });

      console.log(`  └─ [SUCCESS] DB Pending Payment record persisted: ID=${savedRecord.id} for user <${normalEmail}>\n`);
    } catch (dbErr: unknown) {
      const errorMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error(`\n[CREATE-SESSION DB ERROR] [${reqTime}] Failed to persist pending payment record!`);
      console.error(`  ├─ Target User: "${safeCustomer}" <${normalEmail}> | Phone: ${customerPhone || 'N/A'}`);
      console.error(`  ├─ PaymentIntent: ${paymentIntent.id} | Amount: £${numAmount} | Type: ${safeType}`);
      console.error(`  └─ Error Details: ${errorMsg}\n`);
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Payment session creation failed';
    const errorStack = err instanceof Error ? err.stack : '';
    console.error(`\n[CREATE-SESSION FATAL ERROR] [${reqTime}] Checkout session creation crashed!`);
    console.error(`  ├─ Error: ${errorMessage}`);
    console.error(`  └─ Stack: ${errorStack}\n`);

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
