import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SPONSORS_DATA } from '@/data/sponsors';

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: sponsors.length ? sponsors : SPONSORS_DATA });
  } catch {
    return NextResponse.json({ success: true, source: 'memory', data: SPONSORS_DATA });
  }
}
