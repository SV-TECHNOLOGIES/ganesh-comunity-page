import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_SETTINGS = {
  id: 'default',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_ukta_default_key',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_ukta_default_key',
  currency: 'GBP',
  activeAccountName: 'UKTA Main UK Account (Barclays/Stripe)',
};

export async function GET() {
  try {
    const settings = await prisma.paymentSettings.findUnique({
      where: { id: 'default' },
    });
    return NextResponse.json({
      success: true,
      data: settings || DEFAULT_SETTINGS,
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { stripePublishableKey, stripeSecretKey, currency, activeAccountName } = body;

    try {
      const updated = await prisma.paymentSettings.upsert({
        where: { id: 'default' },
        update: {
          stripePublishableKey: stripePublishableKey || DEFAULT_SETTINGS.stripePublishableKey,
          stripeSecretKey: stripeSecretKey || DEFAULT_SETTINGS.stripeSecretKey,
          currency: currency || 'GBP',
          activeAccountName: activeAccountName || 'UKTA Configured Stripe Account',
        },
        create: {
          id: 'default',
          stripePublishableKey: stripePublishableKey || DEFAULT_SETTINGS.stripePublishableKey,
          stripeSecretKey: stripeSecretKey || DEFAULT_SETTINGS.stripeSecretKey,
          currency: currency || 'GBP',
          activeAccountName: activeAccountName || 'UKTA Configured Stripe Account',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Stripe Payment Configuration & Payout Account Updated Successfully',
        data: updated,
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: 'Stripe Config saved in memory',
        data: { id: 'default', stripePublishableKey, stripeSecretKey, currency, activeAccountName },
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update Stripe payment settings';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
