import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { computeResidentRentStatus } from '@/lib/due-date';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const resident = await prisma.resident.findUnique({
      where: { id: params.id },
      include: {
        room: { include: { floor: true } },
        bed: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        complaints: {
          orderBy: { createdAt: 'desc' },
          include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
        },
        transfers: {
          orderBy: { transferDate: 'desc' },
        },
      },
    });

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found.' }, { status: 404 });
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
    console.error('Resident detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch resident.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, monthlyRent } = body;

    const updated = await prisma.resident.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(monthlyRent && { monthlyRent: parseFloat(monthlyRent) }),
      },
    });

    return NextResponse.json({ success: true, resident: updated });
  } catch (error) {
    console.error('Resident update error:', error);
    return NextResponse.json({ error: 'Failed to update resident.' }, { status: 500 });
  }
}
