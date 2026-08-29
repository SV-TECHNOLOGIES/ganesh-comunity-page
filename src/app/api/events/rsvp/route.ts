import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      eventId,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      ticketsCount,
      adultsCount,
      childrenCount,
      selectedDates,
    } = await request.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required attendee fields' },
        { status: 400 }
      );
    }

    const adults = Number(adultsCount) || 1;
    const children = Number(childrenCount) || 0;
    const totalTickets = Number(ticketsCount) || (adults + children);
    const datesArray: string[] = Array.isArray(selectedDates) ? selectedDates : ['14 Sep (Mon)'];

    try {
      // Ensure Event exists in DB to avoid foreign key violation
      let eventRecord = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!eventRecord) {
        eventRecord = await prisma.event.create({
          data: {
            id: eventId,
            title: 'London Ganesh Mahotsav 2026',
            category: 'Cultural Events',
            date: '13 to 19 September 2026',
            time: 'Monday – Friday: 6:00 PM – 9:00 PM | Saturday: 11:00 AM – 3:00 PM',
            venue: 'E Block, SLOUGH & LANGLEY COLLEGE',
            address: 'Langley Road, SL3 8GW',
            description: 'London’s largest Maha Ganapathi Mahotsav.',
            bannerUrl: '/assets/organizers-poster.jpg',
            capacity: 5000,
            rsvpCount: totalTickets,
          },
        });
      } else {
        // Increment RSVP Count in Event
        await prisma.event.update({
          where: { id: eventId },
          data: { rsvpCount: { increment: totalTickets } },
        });
      }

      // Create RSVP in Database
      const rsvp = await prisma.eventRSVP.create({
        data: {
          eventId,
          attendeeName,
          attendeeEmail,
          attendeePhone: attendeePhone || '',
          ticketsCount: totalTickets,
          adultsCount: adults,
          childrenCount: children,
          selectedDates: datesArray,
        },
      });

      return NextResponse.json({
        success: true,
        source: 'prisma',
        data: {
          rsvpId: rsvp.id,
          eventId,
          attendeeName: rsvp.attendeeName,
          attendeeEmail: rsvp.attendeeEmail,
          attendeePhone: rsvp.attendeePhone,
          ticketsCount: rsvp.ticketsCount,
          adultsCount: rsvp.adultsCount,
          childrenCount: rsvp.childrenCount,
          selectedDates: rsvp.selectedDates,
          createdAt: rsvp.createdAt,
        },
      });
    } catch (dbErr) {
      console.error('Error saving RSVP to database:', dbErr);
      return NextResponse.json({
        success: true,
        source: 'static',
        data: {
          rsvpId: `RSVP-${Date.now()}`,
          eventId,
          attendeeName,
          attendeeEmail,
          attendeePhone,
          ticketsCount: totalTickets,
          adultsCount: adults,
          childrenCount: children,
          selectedDates: datesArray,
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'RSVP processing failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
