import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || user.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase().trim() || '';
    const eventId = searchParams.get('eventId');
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '100', 10));

    const where: any = {};
    if (eventId && eventId !== 'all') {
      where.eventId = eventId;
    }

    if (search) {
      const [matchedMembers, matchedAdmins, matchedEvents, matchedMedia] = await Promise.all([
        prisma.member.findMany({
          where: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        }),
        prisma.adminUser.findMany({
          where: {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        }),
        prisma.event.findMany({
          where: { title: { contains: search, mode: 'insensitive' } },
          select: { id: true },
        }),
        prisma.mediaItem.findMany({
          where: { title: { contains: search, mode: 'insensitive' } },
          select: { id: true },
        }),
      ]);

      const matchedUserIds = [...matchedMembers.map((m) => m.id), ...matchedAdmins.map((a) => a.id)];
      const matchedEventIds = matchedEvents.map((e) => e.id);
      const matchedMediaIds = matchedMedia.map((m) => m.id);

      where.OR = [
        { userId: { in: matchedUserIds } },
        { eventId: { in: matchedEventIds } },
        { mediaId: { in: matchedMediaIds } },
        { ip: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, totalCount, statsAgg, distinctUsers] = await Promise.all([
      prisma.mediaDownloadLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mediaDownloadLog.count({ where }),
      prisma.mediaDownloadLog.aggregate({
        _sum: { fileCount: true },
        _count: { id: true },
      }),
      prisma.mediaDownloadLog.groupBy({
        by: ['userId'],
      }),
    ]);

    // Enrich logs with related entity details from their primary tables
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const eventIds = [...new Set(logs.map((l) => l.eventId).filter((id): id is string => Boolean(id) && id !== 'general'))];
    const mediaIds = [...new Set(logs.map((l) => l.mediaId).filter((id): id is string => Boolean(id) && id !== 'ALL'))];

    const [members, adminUsers, events, mediaItems] = await Promise.all([
      prisma.member.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true, email: true, role: true },
      }),
      prisma.adminUser.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, email: true, role: true },
      }),
      prisma.event.findMany({
        where: { id: { in: eventIds } },
        select: { id: true, title: true, date: true },
      }),
      prisma.mediaItem.findMany({
        where: { id: { in: mediaIds } },
        select: { id: true, title: true, url: true, coverImage: true },
      }),
    ]);

    const userMap = new Map<string, { name: string; email: string; role: string }>();
    members.forEach((m) =>
      userMap.set(m.id, { name: m.fullName, email: m.email, role: m.role || 'Member' })
    );
    adminUsers.forEach((a) =>
      userMap.set(a.id, { name: a.username, email: a.email, role: 'Admin' })
    );

    const eventMap = new Map<string, { title: string; date: string }>();
    events.forEach((e) => eventMap.set(e.id, { title: e.title, date: e.date }));

    const mediaMap = new Map<string, { title: string; url: string; coverImage: string | null }>();
    mediaItems.forEach((m) =>
      mediaMap.set(m.id, { title: m.title, url: m.url, coverImage: m.coverImage })
    );

    const enrichedLogs = logs.map((log) => {
      const u = userMap.get(log.userId);
      const ev = eventMap.get(log.eventId);
      const med = log.mediaId ? mediaMap.get(log.mediaId) : undefined;
      return {
        ...log,
        userName: u?.name || 'Member',
        userEmail: u?.email || null,
        role: u?.role || 'Member',
        eventTitle: ev?.title || (log.eventId === 'general' ? 'General Gallery' : log.eventId),
        mediaTitle: med?.title || (log.mediaId === 'ALL' ? 'Complete Album (ZIP)' : log.mediaId),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        logs: enrichedLogs,
        total: totalCount,
        stats: {
          totalDownloads: statsAgg._count.id || 0,
          totalFilesDownloaded: statsAgg._sum.fileCount || 0,
          uniqueUsersCount: distinctUsers.length,
        },
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch download logs';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
