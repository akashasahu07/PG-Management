import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedResident } from '@/lib/auth';
import { computeResidentRentStatus } from '@/lib/due-date';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const residentSession = await getAuthenticatedResident();
    if (!residentSession) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const resident = await prisma.resident.findUnique({
      where: { id: residentSession.id },
      include: {
        room: { include: { floor: true } },
        bed: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5,
        },
        complaints: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });

    if (!resident || resident.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Active resident record not found.' }, { status: 404 });
    }

    const latestPay = resident.payments[0]?.paymentDate;
    const rentStatus = computeResidentRentStatus(resident.joiningDate, latestPay);

    return NextResponse.json({
      resident: {
        ...resident,
        rentStatus,
      },
    });
  } catch (error) {
    console.error('Resident profile error:', error);
    return NextResponse.json({ error: 'Failed to load resident profile.' }, { status: 500 });
  }
}
