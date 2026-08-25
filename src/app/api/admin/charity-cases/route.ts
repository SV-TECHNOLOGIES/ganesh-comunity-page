import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  try {
    const cases = await prisma.charityCase.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: cases });
  } catch {
    const cases = DataStore.getCharityCases();
    return NextResponse.json({ success: true, source: 'datastore', data: cases });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, urgency } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Charity Case ID required' }, { status: 400 });
    }

    try {
      const updated = await prisma.charityCase.update({
        where: { id },
        data: { status, urgency },
      });
      return NextResponse.json({ success: true, source: 'prisma', data: updated });
    } catch {
      DataStore.updateCharityStatus(id, status);
      return NextResponse.json({ success: true, source: 'datastore', message: 'Status updated in DataStore' });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
