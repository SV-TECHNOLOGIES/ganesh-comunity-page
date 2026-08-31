import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim();
    const search = searchParams.get('search')?.trim();

    const where: any = {
      active: true,
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    const members = await prisma.leadershipMember.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: members,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leadership members';
    console.error('[API LEADERSHIP GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}
