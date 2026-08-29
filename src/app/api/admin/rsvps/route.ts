import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const whereClause = eventId ? { eventId } : {};

    const rsvps = await prisma.eventRSVP.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      source: 'prisma',
      data: rsvps,
    });
  } catch (err: unknown) {
    console.error('Error fetching admin RSVPs:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSVPs from database' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'RSVP ID is required' }, { status: 400 });
    }

    const deleted = await prisma.eventRSVP.delete({
      where: { id },
    });

    // Optionally decrement event rsvp count
    if (deleted.eventId) {
      await prisma.event.update({
        where: { id: deleted.eventId },
        data: { rsvpCount: { decrement: deleted.ticketsCount } },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'RSVP deleted successfully',
      data: deleted,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
