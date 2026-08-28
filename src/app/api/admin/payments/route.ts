import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_PAYMENTS = [
  {
    id: 'pay-101',
    amount: 250.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Srinivas & Lakshmi Prasad',
    customerEmail: 'sl.prasad@example.co.uk',
    customerPhone: '+44 7890 123456',
    description: 'Slough Mahotsav Patron Sponsorship & Diya Seva',
    paymentMethod: 'Stripe Card',
    stripePaymentIntentId: 'pi_3Mxt5k2eZvKYlo2C01a2b3c4',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'pay-102',
    amount: 15.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Anil Varma',
    customerEmail: 'anil.v@example.co.uk',
    customerPhone: '+44 7900 654321',
    description: 'MITRA Ugadi Cultural Fest Entry Pass (1 Ticket)',
    paymentMethod: 'Stripe ApplePay',
    stripePaymentIntentId: 'pi_3Mxt9x2eZvKYlo2C05d6e7f8',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'pay-103',
    amount: 100.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Priyanka Reddy',
    customerEmail: 'priyanka.reddy@example.co.uk',
    customerPhone: '+44 7700 987654',
    description: 'Life Membership Plan Registration',
    paymentMethod: 'Stripe Card',
    stripePaymentIntentId: 'pi_3Myu122eZvKYlo2C09g0h1i2',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        member: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      success: true,
      source: 'prisma',
      data: payments.length ? payments : DEMO_PAYMENTS,
    });
  } catch {
    return NextResponse.json({
      success: true,
      source: 'memory',
      data: DEMO_PAYMENTS,
    });
  }
}
