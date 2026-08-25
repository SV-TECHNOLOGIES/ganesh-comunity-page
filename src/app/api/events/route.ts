import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: events });
  } catch {
    const events = DataStore.getEvents();
    return NextResponse.json({ success: true, source: 'datastore', data: events });
  }
}
