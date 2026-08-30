import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type')?.trim() || 'all';
    const status = searchParams.get('status')?.trim() || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = searchParams.get('limit') === 'all' ? 0 : Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const exportAll = searchParams.get('exportAll') === 'true';

    console.log(`[ADMIN PAYMENTS API] [${timestamp}] GET query: search="${search}", type="${type}", status="${status}", page=${page}, limit=${limit}`);

    // Build Prisma Where Clause
    const whereConditions: Prisma.PaymentWhereInput[] = [];

    // Status Filter
    if (status && status !== 'all') {
      whereConditions.push({
        status: { equals: status, mode: 'insensitive' },
      });
    }

    // Type Filter
    if (type && type !== 'all') {
      whereConditions.push({
        OR: [
          { donationType: { contains: type, mode: 'insensitive' } },
          { description: { contains: type, mode: 'insensitive' } },
        ],
      });
    }

    // Search Query Filter
    if (search) {
      whereConditions.push({
        OR: [
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerEmail: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search, mode: 'insensitive' } },
          { primaryDevoteeName: { contains: search, mode: 'insensitive' } },
          { gotram: { contains: search, mode: 'insensitive' } },
          { familyMembers: { contains: search, mode: 'insensitive' } },
          { eventName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.PaymentWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // 1. Calculate Full Database Stats (across all payments in DB)
    const [allPayments, totalFiltered] = await Promise.all([
      prisma.payment.findMany({
        select: {
          id: true,
          amount: true,
          status: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    let completedTotal = 0;
    let completedCount = 0;
    let pendingTotal = 0;
    let pendingCount = 0;
    let failedTotal = 0;
    let failedCount = 0;
    let totalRevenue = 0;
    const totalCount = allPayments.length;

    for (const p of allPayments) {
      const amt = p.amount || 0;
      const st = (p.status || '').toLowerCase();
      totalRevenue += amt;

      if (st === 'completed') {
        completedTotal += amt;
        completedCount++;
      } else if (st === 'pending') {
        pendingTotal += amt;
        pendingCount++;
      } else if (st === 'failed') {
        failedTotal += amt;
        failedCount++;
      }
    }

    // 2. Query Paginated Records
    let payments;
    if (exportAll || limit === 0) {
      payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } else {
      payments = await prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }

    const effectiveLimit = limit === 0 ? totalFiltered : limit;
    const totalPages = effectiveLimit > 0 ? Math.max(1, Math.ceil(totalFiltered / effectiveLimit)) : 1;

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: payments,
        pagination: {
          total: totalFiltered,
          page,
          limit: effectiveLimit,
          totalPages,
        },
        stats: {
          completedTotal,
          completedCount,
          pendingTotal,
          pendingCount,
          failedTotal,
          failedCount,
          totalRevenue,
          totalCount,
        },
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
    console.error(`[ADMIN PAYMENTS API ERROR] [${timestamp}] Failed to fetch payment records:`, error);

    return NextResponse.json(
      {
        success: false,
        source: 'error',
        error: errorMessage,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        stats: {
          completedTotal: 0,
          completedCount: 0,
          pendingTotal: 0,
          pendingCount: 0,
          failedTotal: 0,
          failedCount: 0,
          totalRevenue: 0,
          totalCount: 0,
        },
      },
      { status: 500 }
    );
  }
}
