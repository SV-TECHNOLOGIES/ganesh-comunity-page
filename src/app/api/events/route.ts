import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function enrichEventWithFallbackTiers(event: any) {
  if (!event) return event;
  const tiers = (event.ticketTiers || []).map((t: any) => ({
    ...t,
    price: Number(t.price),
    bookingFee: t.bookingFee !== null && t.bookingFee !== undefined ? Number(t.bookingFee) : 0,
    allowDirectBooking: t.allowDirectBooking ?? true,
  }));
  const bundles = (event.bundles || []).map((b: any) => ({
    ...b,
    bundlePrice: Number(b.bundlePrice),
    bookingFee: b.bookingFee !== null && b.bookingFee !== undefined ? Number(b.bookingFee) : 0,
    items: (b.items || []).map((bi: any) => ({
      ...bi,
      ticketTier: bi.ticketTier ? {
        ...bi.ticketTier,
        price: Number(bi.ticketTier.price),
        bookingFee: bi.ticketTier.bookingFee !== null && bi.ticketTier.bookingFee !== undefined ? Number(bi.ticketTier.bookingFee) : 0,
        allowDirectBooking: bi.ticketTier.allowDirectBooking ?? true,
      } : null,
    })),
  }));

  // Backward compatibility: If no dynamic tiers defined in DB, synthesize fallback tiers from legacy columns
  if (tiers.length === 0) {
    const adultPrice = Number(event.ticketPrice) || 0;
    const childPrice = Number(event.childTicketPrice) || 0;
    tiers.push({
      id: `fallback-adult-${event.id}`,
      eventId: event.id,
      name: adultPrice === 0 ? 'General Admission (Adult)' : 'Standard Adult Ticket',
      description: 'Adult pass (above 5 years)',
      price: adultPrice,
      bookingFee: 0,
      currency: 'GBP',
      capacity: event.adultCapacity || null,
      bookedCount: 0,
      isActive: true,
      allowDirectBooking: true,
    });
    if (childPrice > 0 || (adultPrice > 0 && event.childTicketPrice !== undefined)) {
      tiers.push({
        id: `fallback-child-${event.id}`,
        eventId: event.id,
        name: childPrice === 0 ? 'Child Pass (Free)' : 'Child Ticket',
        description: 'Child pass (below 5 years)',
        price: childPrice,
        bookingFee: 0,
        currency: 'GBP',
        capacity: event.childCapacity || null,
        bookedCount: 0,
        isActive: true,
        allowDirectBooking: true,
      });
    }
  }

  return {
    ...event,
    ticketTiers: tiers,
    bundles,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const tierInclude = {
      ticketTiers: {
        where: { isActive: true },
        orderBy: { price: 'asc' as const },
      },
      bundles: {
        where: { isActive: true },
        include: {
          items: {
            include: { ticketTier: true },
          },
        },
      },
    };

    if (id) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: tierInclude,
      });

      return NextResponse.json(
        { success: true, source: 'prisma', data: enrichEventWithFallbackTiers(event) }
      );
    }

    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: tierInclude,
    });

    const enrichedEvents = events.map(enrichEventWithFallbackTiers);

    return NextResponse.json(
      { success: true, source: 'prisma', data: enrichedEvents }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error fetching events';
    console.error('[API EVENTS GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}
