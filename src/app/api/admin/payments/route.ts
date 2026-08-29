import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const timestamp = new Date().toISOString();
  console.log(`[ADMIN PAYMENTS API] [${timestamp}] GET request received for payment ledger.`);

  try {
    const payments = await prisma.payment.findMany({
      
      orderBy: { createdAt: 'desc' },
    });

    console.log(`[ADMIN PAYMENTS API] [${timestamp}] Retrieved ${payments.length} payment records from PostgreSQL.`);

    return NextResponse.json({
      success: true,
      source: 'prisma',
      count: payments.length,
      data: payments,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
    console.error(`[ADMIN PAYMENTS API ERROR] [${timestamp}] Failed to fetch payment records:`, error);

    return NextResponse.json(
      {
        success: false,
        source: 'error',
        error: errorMessage,
        count: 0,
        data: [],
      },
      { status: 500 }
    );
  }
}
