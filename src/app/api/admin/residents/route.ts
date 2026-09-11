import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { generateResidentId } from '@/lib/id-generator';
import { createNotification } from '@/lib/notifications';
import { computeResidentRentStatus } from '@/lib/due-date';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const floor = searchParams.get('floor') || '';
    const status = searchParams.get('status') || '';
    const paymentFilter = searchParams.get('payment') || '';

    const residents = await prisma.resident.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { phone: { contains: search } },
                  { residentId: { contains: search } },
                  { room: { roomNumber: { contains: search } } },
                ],
              }
            : {},
          floor ? { room: { floor: { code: floor } } } : {},
          status ? { status: status.toUpperCase() } : {},
        ],
      },
      include: {
        room: { include: { floor: true } },
        bed: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute dynamic rent status for each resident
    const enrichedResidents = residents.map((r) => {
      const latestPay = r.payments[0]?.paymentDate;
      const rentStatus = computeResidentRentStatus(r.joiningDate, latestPay);
      return {
        ...r,
        rentStatus,
      };
    });

    // If filtered by payment status (e.g. OVERDUE, DUE_TODAY, PAID, etc.)
    const filtered = paymentFilter
      ? enrichedResidents.filter((r) => r.rentStatus.status === paymentFilter)
      : enrichedResidents;

    return NextResponse.json({ residents: filtered });
  } catch (error) {
    console.error('Residents fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch residents.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, roomId, bedId, joiningDate, monthlyRent } = body;

    if (!name || !phone || !roomId || !bedId || !joiningDate) {
      return NextResponse.json(
        { error: 'All fields (Name, Phone, Room, Bed, Joining Date) are required.' },
        { status: 400 }
      );
    }

    // Verify bed is available
    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: { room: true },
    });

    if (!bed || bed.roomId !== roomId) {
      return NextResponse.json({ error: 'Invalid bed or room selection.' }, { status: 400 });
    }

    if (bed.status === 'OCCUPIED') {
      return NextResponse.json({ error: 'Selected bed is already occupied.' }, { status: 400 });
    }

    // Determine sequence number for this room
    const existingCount = await prisma.resident.count({
      where: { roomId },
    });
    const sequenceNumber = existingCount + 1;
    const residentId = generateResidentId(bed.room.roomNumber, sequenceNumber);

    const rent = monthlyRent ? parseFloat(monthlyRent) : bed.room.monthlyRent;

    // Create resident in transaction
    const resident = await prisma.$transaction(async (tx) => {
      const newResident = await tx.resident.create({
        data: {
          residentId,
          name: name.trim(),
          phone: phone.trim(),
          roomId,
          bedId,
          joiningDate: new Date(joiningDate),
          monthlyRent: rent,
          status: 'ACTIVE',
        },
        include: {
          room: { include: { floor: true } },
          bed: true,
        },
      });

      // Mark bed occupied
      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' },
      });

      // Update room status
      const totalBeds = await tx.bed.count({ where: { roomId } });
      const occupiedBeds = await tx.bed.count({ where: { roomId, status: 'OCCUPIED' } });

      let roomStatus = 'AVAILABLE';
      if (occupiedBeds === totalBeds) {
        roomStatus = 'FULL';
      } else if (occupiedBeds > 0) {
        roomStatus = 'PARTIAL';
      }

      await tx.room.update({
        where: { id: roomId },
        data: { status: roomStatus },
      });

      return newResident;
    });

    // Create notification
    await createNotification({
      type: 'NEW_RESIDENT',
      title: 'New Resident Registered',
      message: `${resident.name} has been onboarded into Room ${resident.room.roomNumber}, Bed ${resident.bed.bedNumber}. (ID: ${resident.residentId})`,
      link: `/admin/residents/${resident.id}`,
    });

    return NextResponse.json({ success: true, resident }, { status: 201 });
  } catch (error) {
    console.error('Resident create error:', error);
    return NextResponse.json({ error: 'Failed to create resident.' }, { status: 500 });
  }
}
