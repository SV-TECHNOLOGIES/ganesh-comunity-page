import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendPaymentFailureAlert } from '@/lib/email';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/report-failure
 *
 * Receives client-side payment confirmation errors (e.g. card declined, insufficient funds, 3DS authentication failure).
 * 1. Updates DB payment status to 'Failed' if paymentIntentId is provided.
 * 2. Writes structured failure record into SystemLog.
 * 3. Sends instant payment failure email notification to REPORT_MAIL.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      amount,
      currency = 'GBP',
      cause,
      paymentIntentId,
      errorMessage,
      errorCode,
      declineCode,
    } = body;

    const devoteeName = customerName || 'Devotee / Customer';
    const devoteeEmail = customerEmail || 'Not Provided';
    const failureMsg = errorMessage || 'Card confirmation failed';

    // 1. Update DB payment record if paymentIntentId is present
    if (paymentIntentId) {
      try {
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: { status: 'Failed' },
        });
      } catch (dbErr) {
        console.warn('[Report Failure] Could not update payment status in DB:', dbErr);
      }
    }

    // 2. Persist to SystemLog
    await logger.paymentFailure('payments/client-checkout', `Client payment failure: £${amount} from ${devoteeName} (${failureMsg})`, {
      paymentIntentId,
      amount,
      currency,
      customerName: devoteeName,
      customerEmail: devoteeEmail,
      customerPhone,
      cause,
      errorMessage: failureMsg,
      errorCode,
      declineCode,
    });

    // 3. Send email to REPORT_MAIL
    try {
      await sendPaymentFailureAlert({
        customerName: devoteeName,
        customerEmail: devoteeEmail,
        customerPhone,
        amount,
        currency,
        cause,
        paymentIntentId,
        failureReason: failureMsg,
        errorCode,
        declineCode,
        source: 'Client Stripe ConfirmPayment',
        metadata: body,
      });
    } catch (mailErr) {
      await logger.error('payments/report-failure', 'Failed to dispatch failure email alert', mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to process failure report';
    await logger.error('payments/report-failure', `Error in report-failure endpoint: ${errorMsg}`, err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
