import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateTicketToken } from '@/lib/ticket-token';



export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Read JWT token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('mitra_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    // Verify & decode token
    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid session.' }, { status: 401 });
    }

    const userId = payload.id as string;
    const userEmail = payload.email as string | undefined;

    // Query payments linked to this devotee by memberId or email
    try {
      const payments = await prisma.payment.findMany({
        where: {
          OR: [
            ...(userId ? [{ memberId: userId }] : []),
            ...(userEmail ? [{ customerEmail: userEmail }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      // If DB has records for this user, return them with unpredictable ticketToken
      if (payments.length > 0) {
        const enriched = payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          customerPhone: p.customerPhone,
          description: p.description,
          paymentMethod: p.paymentMethod,
          memberId: p.memberId,
          eventId: p.eventId,
          eventName: p.eventName,
          donationType: p.donationType,
          poojaDate: p.poojaDate,
          poojaDay: p.poojaDay,
          poojaTitle: p.poojaTitle,
          gotram: p.gotram,
          familyMembers: p.familyMembers,
          primaryDevoteeName: p.primaryDevoteeName,
          createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
          ticketToken: generateTicketToken(p.id),
        }));
        return NextResponse.json(
          { success: true, source: 'prisma', data: enriched },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }
        );
      }
    } catch {
      // DB unavailable
    }


    // No payments found for this user
    return NextResponse.json({ success: true, source: 'empty', data: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
