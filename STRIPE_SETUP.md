# Stripe Integration Setup Guide

Complete setup guide for the UKTA Stripe payment integration — covers local development and production deployment.

---

## Prerequisites

- A [Stripe account](https://dashboard.stripe.com/register) (free to create)
- Node.js ≥ 18 and `npm` installed
- Stripe CLI (for local webhook testing — see below)

---

## 1. Get Your Stripe API Keys

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers → API Keys**
3. Copy:
   - **Publishable key** — starts with `pk_test_...` (test) or `pk_live_...` (production)
   - **Secret key** — starts with `sk_test_...` (test) or `sk_live_...` (production)

> [!CAUTION]
> Never commit live secret keys to version control. The `.env` file is in `.gitignore` by default.

---

## 2. Configure Environment Variables

Open `.env` in the project root and replace the placeholder values:

```env
# Stripe Payment Gateway
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"  # set in step 3
```

Then restart the dev server:

```bash
npm run dev
```

---

## 3. Set Up Webhooks (Required for Payment Confirmation)

Stripe webhooks update the payment status in the database after a payment succeeds or fails. Without this, payments will stay in `Pending` state in the admin ledger.

### 3a. Local Development (Stripe CLI)

**Install Stripe CLI:**

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli#install
```

**Login to Stripe CLI:**

```bash
stripe login
```

**Start webhook forwarding** (run in a second terminal while `npm run dev` is running):

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

You will see output like:

```
> Ready! Your webhook signing secret is whsec_abc123xyz...
```

Copy that `whsec_...` value into your `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_abc123xyz..."
```

Restart `npm run dev` — the webhook is now active.

### 3b. Production Deployment

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set the URL to: `https://your-domain.com/api/payments/webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click **Add endpoint**
6. Click on the webhook → reveal the **Signing secret** (`whsec_...`)
7. Add it to your hosting provider's environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 4. Test the Full Payment Flow

### Test Cards (Stripe Test Mode)

Use these card numbers in the payment form — any future expiry date, any 3-digit CVC:

| Scenario | Card Number |
|---|---|
| ✅ Successful payment | `4242 4242 4242 4242` |
| ❌ Card declined | `4000 0000 0000 0002` |
| 🔐 3D Secure required | `4000 0025 0000 3155` |
| 💳 Insufficient funds | `4000 0000 0000 9995` |

### Step-by-step test:

1. Open `/donate` — the DonationModal will appear
2. Select a category (e.g. **Annadanam**) and amount (e.g. £51)
3. Enter your name and a valid email
4. Click **Proceed to Pay** — Stripe creates a real PaymentIntent
5. Stripe's Payment Element loads — enter `4242 4242 4242 4242`, any future expiry, any CVC
6. Click **Pay £51.00 Securely**
7. ✅ Thank-you / receipt screen appears with confetti
8. Go to **Admin → Payments → Payments Ledger** — the transaction appears as `Completed`

---

## 5. Configure Stripe Keys via Admin Panel (Dynamic Switching)

You can update Stripe keys **without redeploying** through the Admin Panel:

1. Log in to `/admin`
2. Go to **Payments → Stripe Account Config** tab
3. Paste your new Publishable Key and Secret Key
4. Click **Save & Switch Stripe Payout Account**

All future payments will immediately use the new Stripe account. This lets you switch between test and live accounts, or between different UKTA Stripe accounts, with zero downtime.

> [!IMPORTANT]
> When switching from test to live keys, also update `STRIPE_WEBHOOK_SECRET` in your hosting environment with the live endpoint's signing secret.

---

## 6. Architecture Overview

```
User fills donation form
        ↓
POST /api/payments/create-session
  → Reads Stripe secret key (DB → .env fallback)
  → Creates real Stripe PaymentIntent
  → Saves Payment record (status: Pending) in DB
  → Returns clientSecret to browser
        ↓
Browser: Stripe PaymentElement renders
  → User enters card details (PCI-DSS secure iframe)
  → stripe.confirmPayment() called
        ↓
Stripe processes payment
  → Sends webhook event to /api/payments/webhook
  → Webhook updates Payment.status → 'Completed' or 'Failed'
        ↓
Browser: success callback fires
  → Receipt / thank-you screen shown
  → Admin ledger reflects Completed status
```

---

## 7. Files Modified / Created

| File | Change |
|---|---|
| `.env` | Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `src/app/api/payments/create-session/route.ts` | Rewired to create real Stripe PaymentIntent; returns `clientSecret` |
| `src/app/api/payments/get-publishable-key/route.ts` | **NEW** — serves publishable key to client (DB → env fallback) |
| `src/app/api/payments/webhook/route.ts` | **NEW** — handles `payment_intent.succeeded/failed/canceled` |
| `src/components/DonationModal.tsx` | **Rewritten** — two-step flow with real Stripe Elements |
| `src/lib/types.ts` | Added optional `status` field to `DonationRecord` |

---

## 8. Troubleshooting

| Problem | Solution |
|---|---|
| "Stripe is not configured" error on donate page | Add your `STRIPE_SECRET_KEY` to `.env` and restart the server |
| Payment Element doesn't render | Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set and valid |
| Payments stay `Pending` in admin | Stripe CLI is not forwarding webhooks — run `stripe listen --forward-to localhost:3000/api/payments/webhook` |
| Webhook signature error | Your `STRIPE_WEBHOOK_SECRET` doesn't match — copy the exact `whsec_...` from `stripe listen` output |
| 3D Secure payments fail | Use card `4000 0025 0000 3155` to test — the Payment Element handles 3DS automatically |
| "Amount must be at least £0.50" | Stripe's minimum charge is 50p — ensure selected amount ≥ 1 |
