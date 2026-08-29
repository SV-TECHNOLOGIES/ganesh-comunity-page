import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Retrieve all completed payments related to Pooja Seva or Pooja Booking
    const payments = await prisma.payment.findMany({
      where: {
        status: 'Completed',
        OR: [
          { donationType: 'pooja' },
          { poojaDate: { not: null } },
          { description: { contains: 'Pooja Booking' } },
          { description: { contains: 'Pooja Seva' } }
        ]
      },
      select: {
        description: true,
        poojaDate: true,
      }
    });

    const dates = [
      '13th Sep',
      '14th Sep',
      '15th Sep',
      '16th Sep',
      '17th Sep',
      '18th Sep',
      '19th Sep'
    ];

    // Initialize counts for each of the 7 days
    const counts: Record<string, number> = {};
    dates.forEach(d => {
      counts[d] = 0;
    });

    // Count occurrences by poojaDate column or parsing description string
    payments.forEach(p => {
      if (p.poojaDate && counts[p.poojaDate] !== undefined) {
        counts[p.poojaDate] += 1;
        return;
      }

      const desc = p.description || '';
      for (const d of dates) {
        if (desc.includes(d)) {
          counts[d] = (counts[d] || 0) + 1;
          break;
        }
      }
    });

    return NextResponse.json({ success: true, counts });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    console.error('[Booking Counts API] Error:', message);
    
    // Return success: false but do not crash the frontend
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
