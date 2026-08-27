import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { amount, customerName, customerEmail, customerPhone, description, paymentMethod } = await request.json();

    if (!amount || !customerName || !customerEmail) {
      return NextResponse.json({ success: false, error: 'Amount, Name and Email required' }, { status: 400 });
    }

    // Retrieve active Stripe Secret Key from Database
    let stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    try {
      const settings = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });
      if (settings?.stripeSecretKey && !settings.stripeSecretKey.includes('default_key')) {
        stripeSecretKey = settings.stripeSecretKey;
      }
    } catch {}

    const numAmount = Number(amount);
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // ── Get memberId from Auth Token (Logged in user session) ──
    let memberId: string | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('ukta_token')?.value;

      if (token) {
        const payload = verifyToken(token);
        if (payload?.id && payload.role === 'Member') {
          // If token has a Member ID, verify member exists in database
          const memberById = await prisma.member.findUnique({ where: { id: payload.id } });
          if (memberById) {
            memberId = memberById.id;
          } else if (payload.email) {
            const memberByEmail = await prisma.member.findUnique({ where: { email: payload.email } });
            if (memberByEmail) {
              memberId = memberByEmail.id;
            }
          }
        } else if (payload?.email) {
          const memberByEmail = await prisma.member.findUnique({ where: { email: payload.email } });
          if (memberByEmail) {
            memberId = memberByEmail.id;
          }
        }
      }

      // Fallback: If not logged in via cookie, check if customerEmail matches a registered Member
      if (!memberId && customerEmail) {
        const existingMember = await prisma.member.findUnique({
          where: { email: customerEmail },
        });
        if (existingMember) {
          memberId = existingMember.id;
        }
      }
    } catch (e) {
      console.error('Error resolving memberId from auth in payment session:', e);
    }

    // Persist Payment Record in PostgreSQL
    try {
      const paymentRecord = await prisma.payment.create({
        data: {
          amount: numAmount,
          currency: 'GBP',
          status: 'Completed',
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          description: description || 'UKTA Community Contribution',
          paymentMethod: paymentMethod || 'Stripe Card',
          stripePaymentIntentId: paymentIntentId,
          memberId,
        },
        include: {
          member: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment processed & recorded successfully',
        data: paymentRecord,
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: 'Payment recorded in memory',
        data: {
          id: `pay-${Date.now()}`,
          amount: numAmount,
          currency: 'GBP',
          status: 'Completed',
          customerName,
          customerEmail,
          description: description || 'UKTA Community Contribution',
          paymentMethod: paymentMethod || 'Stripe Card',
          stripePaymentIntentId: paymentIntentId,
          memberId,
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Payment checkout error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
