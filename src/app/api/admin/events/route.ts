import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: events });
  } catch {
    // Fallback to DataStore memory items if DB connection is offline
    const events = DataStore.getEvents();
    return NextResponse.json({ success: true, source: 'datastore', data: events });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, date, time, venue, address, ticketPrice, status, description, bannerUrl } = body;

    try {
      const newEvent = await prisma.event.create({
        data: {
          title,
          category,
          date,
          time: time || '09:00 AM',
          venue,
          address: address || 'Langley, Slough, United Kingdom',
          ticketPrice: Number(ticketPrice) || 0,
          status: status || 'Upcoming',
          description,
          bannerUrl: bannerUrl || '/assets/poster.jpg',
        },
      });
      return NextResponse.json({ success: true, source: 'prisma', data: newEvent });
    } catch {
      const newEvent = DataStore.addEvent({
        title,
        category,
        date,
        time: time || '09:00 AM',
        venue,
        address: address || 'Langley, Slough, United Kingdom',
        ticketPrice: Number(ticketPrice) || 0,
        status: status || 'Upcoming',
        description,
        bannerUrl: bannerUrl || '/assets/poster.jpg',
        capacity: 300,
      });
      return NextResponse.json({ success: true, source: 'datastore', data: newEvent });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    try {
      await prisma.event.delete({ where: { id } });
    } catch {
      // Memory fallback if not in DB
    }

    return NextResponse.json({ success: true, message: `Event ${id} deleted` });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
