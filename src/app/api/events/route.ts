import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EVENTS_DATA } from '@/data/events';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: events });
  } catch {
    return NextResponse.json({ success: true, source: 'static', data: EVENTS_DATA });
  }
}
