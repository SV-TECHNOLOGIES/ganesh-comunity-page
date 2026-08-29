import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { eventId, attendeeName, attendeeEmail, attendeePhone, ticketsCount } = await request.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json({ success: false, error: 'Missing required attendee fields' }, { status: 400 });
    }

    const tickets = Number(ticketsCount) || 1;

    try {
      const rsvp = await prisma.eventRSVP.create({
        data: {
          eventId,
          attendeeName,
          attendeeEmail,
          attendeePhone: attendeePhone || '',
          ticketsCount: tickets,
        },
      });

      // Increment RSVP Count in Event
      await prisma.event.update({
        where: { id: eventId },
        data: { rsvpCount: { increment: tickets } },
      });

      return NextResponse.json({
        success: true,
        source: 'prisma',
        data: { rsvpId: rsvp.id, eventId, attendeeName, ticketsCount: tickets },
      });
    } catch {
      return NextResponse.json({
        success: true,
        source: 'static',
        data: { rsvpId: `RSVP-${Date.now()}`, eventId, attendeeName, ticketsCount: tickets },
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'RSVP processing failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
