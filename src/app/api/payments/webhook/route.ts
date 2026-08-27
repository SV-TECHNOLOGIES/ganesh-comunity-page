import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * POST /api/payments/webhook
 *
 * Handles Stripe webhook events to keep our DB in sync with actual payment state.
 *
 * Events handled:
 *   • payment_intent.succeeded  → Payment.status = 'Completed'
 *   • payment_intent.payment_failed → Payment.status = 'Failed'
 *
 * Webhook signature is verified using STRIPE_WEBHOOK_SECRET.
 *
 * ── Local Dev Setup ──────────────────────────────────────────────────────────
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Run: stripe listen --forward-to localhost:3000/api/payments/webhook
 * 3. Copy the "webhook signing secret" printed to your .env as STRIPE_WEBHOOK_SECRET
 *
 * ── Production Setup ─────────────────────────────────────────────────────────
 * Register https://your-domain.com/api/payments/webhook in Stripe Dashboard
 * → Developers → Webhooks → Add endpoint.
 * Copy the signing secret to your hosting provider's env vars.
 */

// Next.js App Router: disable body parsing so we can verify the raw body signature
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // Resolve the current Stripe Secret Key (DB → env)
  let stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  try {
    const settings = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });
    if (
      settings?.stripeSecretKey &&
      !settings.stripeSecretKey.includes('default_key') &&
      !settings.stripeSecretKey.includes('REPLACE_WITH')
    ) {
      stripeSecretKey = settings.stripeSecretKey;
    }
  } catch {
    // DB unavailable — use env var
  }

  if (!stripeSecretKey || stripeSecretKey.includes('REPLACE_WITH')) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-07-29.dahlia' });


  // Read the raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    if (!webhookSecret || webhookSecret.includes('REPLACE_WITH')) {
      // If no webhook secret is configured, attempt to parse without verification
      // (only safe in development — in production ALWAYS set STRIPE_WEBHOOK_SECRET)
      console.warn('[Webhook] No STRIPE_WEBHOOK_SECRET set — skipping signature verification (DEV only)');
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[Webhook] Signature error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Handle Events ─────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] PaymentIntent succeeded: ${pi.id}`);

        // Try to update existing pending record, or create a new one from metadata
        try {
          const existing = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: pi.id },
          });

          if (existing) {
            await prisma.payment.update({
              where: { id: existing.id },
              data: { status: 'Completed' },
            });
          } else {
            // Fallback: create from PaymentIntent metadata (edge case if DB write failed earlier)
            const meta = pi.metadata || {};
            await prisma.payment.create({
              data: {
                amount: pi.amount / 100,
                currency: pi.currency.toUpperCase(),
                status: 'Completed',
                customerName: meta.customerName || 'Unknown',
                customerEmail: meta.customerEmail || '',
                customerPhone: meta.customerPhone || null,
                description: pi.description || 'UKTA Community Contribution',
                paymentMethod: meta.paymentMethod || 'Stripe',
                stripePaymentIntentId: pi.id,
                memberId: meta.memberId || null,
              },
            });
          }
        } catch (dbErr) {
          console.error('[Webhook] DB update error on succeeded:', dbErr);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] PaymentIntent failed: ${pi.id}`);

        try {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: pi.id },
            data: { status: 'Failed' },
          });
        } catch (dbErr) {
          console.error('[Webhook] DB update error on failed:', dbErr);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        try {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: pi.id },
            data: { status: 'Failed' },
          });
        } catch {}
        break;
      }

      default:
        // Ignore other event types
        break;
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err);
    // Return 200 to prevent Stripe from retrying — we log but don't break the webhook
  }

  return NextResponse.json({ received: true });
}
