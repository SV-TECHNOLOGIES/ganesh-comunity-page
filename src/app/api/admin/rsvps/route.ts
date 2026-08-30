import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_FESTIVAL_DATES = [
  { id: '13-sep', date: '13 Sep (Sun)', title: 'Ganapathi Agamana & Sthapana' },
  { id: '14-sep', date: '14 Sep (Mon)', title: 'Maha Ganapati Chaturthi' },
  { id: '15-sep', date: '15 Sep (Tue)', title: 'Vidya & Arogya Ganapati' },
  { id: '16-sep', date: '16 Sep (Wed)', title: 'Lakshmi Ganapati' },
  { id: '17-sep', date: '17 Sep (Thu)', title: 'Korikala Ganapati' },
  { id: '18-sep', date: '18 Sep (Fri)', title: 'Bhakti Ganapati' },
  { id: '19-sep', date: '19 Sep (Sat)', title: 'Utsava Ganapati & Visarjan' },
];

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId')?.trim() || 'all';
    const selectedDate = searchParams.get('selectedDate')?.trim() || 'all';
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = searchParams.get('limit') === 'all' ? 0 : Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const exportAll = searchParams.get('exportAll') === 'true';

    console.log(`[ADMIN RSVPS API] [${timestamp}] GET query: eventId="${eventId}", selectedDate="${selectedDate}", search="${search}", page=${page}, limit=${limit}`);

    // Base condition for the event (used for analytics calculation)
    const eventWhere: Prisma.EventRSVPWhereInput = eventId && eventId !== 'all' ? { eventId } : {};

    // 1. Fetch all RSVPs for this event (or all events) to compute Day Analytics & overall stats
    const allEventRSVPs = await prisma.eventRSVP.findMany({
      where: eventWhere,
      select: {
        id: true,
        ticketsCount: true,
        adultsCount: true,
        childrenCount: true,
        selectedDates: true,
        createdAt: true,
      },
    });

    let totalRSVPs = allEventRSVPs.length;
    let totalPasses = 0;
    let totalAdults = 0;
    let totalChildren = 0;

    // Day Analytics Map: date -> stats
    const dayStatsMap = new Map<string, { date: string; title: string; bookingsCount: number; totalPasses: number; adultsCount: number; childrenCount: number }>();

    // Initialize with standard festival dates
    DEFAULT_FESTIVAL_DATES.forEach((f) => {
      dayStatsMap.set(f.date, {
        date: f.date,
        title: f.title,
        bookingsCount: 0,
        totalPasses: 0,
        adultsCount: 0,
        childrenCount: 0,
      });
    });

    // Populate day stats from actual RSVPs
    for (const r of allEventRSVPs) {
      const tickets = r.ticketsCount || (r.adultsCount + r.childrenCount) || 1;
      const adults = r.adultsCount ?? 1;
      const children = r.childrenCount ?? 0;

      totalPasses += tickets;
      totalAdults += adults;
      totalChildren += children;

      const dates = Array.isArray(r.selectedDates) && r.selectedDates.length > 0
        ? r.selectedDates
        : ['14 Sep (Mon)'];

      for (const d of dates) {
        if (!dayStatsMap.has(d)) {
          dayStatsMap.set(d, {
            date: d,
            title: `Festival Day - ${d}`,
            bookingsCount: 0,
            totalPasses: 0,
            adultsCount: 0,
            childrenCount: 0,
          });
        }
        const curr = dayStatsMap.get(d)!;
        curr.bookingsCount += 1;
        curr.totalPasses += tickets;
        curr.adultsCount += adults;
        curr.childrenCount += children;
      }
    }

    const dayAnalytics = Array.from(dayStatsMap.values());

    // 2. Build Prisma Filter Where Clause for Attendee Table Query
    const whereConditions: Prisma.EventRSVPWhereInput[] = [];

    if (eventId && eventId !== 'all') {
      whereConditions.push({ eventId });
    }

    if (selectedDate && selectedDate !== 'all') {
      whereConditions.push({
        selectedDates: {
          has: selectedDate,
        },
      });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { attendeeName: { contains: search, mode: 'insensitive' } },
          { attendeeEmail: { contains: search, mode: 'insensitive' } },
          { attendeePhone: { contains: search, mode: 'insensitive' } },
          { travellingFrom: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const tableWhere: Prisma.EventRSVPWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // 3. Count total matching records for pagination
    const totalFiltered = await prisma.eventRSVP.count({ where: tableWhere });

    // 4. Query paginated records with event details
    let rsvps;
    if (exportAll || limit === 0) {
      rsvps = await prisma.eventRSVP.findMany({
        where: tableWhere,
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
    } else {
      rsvps = await prisma.eventRSVP.findMany({
        where: tableWhere,
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }

    // 5. Enrich RSVPs with Member account status
    const attendeeEmails = rsvps.map((r) => r.attendeeEmail.toLowerCase().trim()).filter(Boolean);
    let memberEmailSet = new Set<string>();

    if (attendeeEmails.length > 0) {
      try {
        const existingMembers = await prisma.member.findMany({
          where: {
            email: { in: attendeeEmails },
          },
          select: { email: true, id: true, tier: true, status: true },
        });
        existingMembers.forEach((m) => memberEmailSet.add(m.email.toLowerCase().trim()));
      } catch (e) {
        console.warn('[ADMIN RSVPS] Error querying member status:', e);
      }
    }

    const enrichedRsvps = rsvps.map((r) => ({
      ...r,
      isMember: memberEmailSet.has(r.attendeeEmail.toLowerCase().trim()),
    }));

    const effectiveLimit = limit === 0 ? totalFiltered : limit;
    const totalPages = effectiveLimit > 0 ? Math.max(1, Math.ceil(totalFiltered / effectiveLimit)) : 1;

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: enrichedRsvps,
        pagination: {
          total: totalFiltered,
          page,
          limit: effectiveLimit,
          totalPages,
        },
        stats: {
          totalRSVPs,
          totalPasses,
          totalAdults,
          totalChildren,
        },
        dayAnalytics,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error fetching admin RSVPs:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch RSVPs from database',
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
        stats: { totalRSVPs: 0, totalPasses: 0, totalAdults: 0, totalChildren: 0 },
        dayAnalytics: [],
      },
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

    if (deleted.eventId) {
      await prisma.event
        .update({
          where: { id: deleted.eventId },
          data: { rsvpCount: { decrement: deleted.ticketsCount } },
        })
        .catch(() => {});
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
