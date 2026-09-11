import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { leavingDate, reason } = await req.json();

    const resident = await prisma.resident.findUnique({
      where: { id: params.id },
      include: { room: true, bed: true },
    });

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found.' }, { status: 404 });
    }

    if (resident.status === 'CHECKED_OUT') {
      return NextResponse.json({ error: 'Resident is already checked out.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark resident checked out
      await tx.resident.update({
        where: { id: params.id },
        data: {
          status: 'CHECKED_OUT',
          leavingDate: leavingDate ? new Date(leavingDate) : new Date(),
          checkoutReason: reason || 'Normal Checkout',
        },
      });

      // 2. Free the bed
      await tx.bed.update({
        where: { id: resident.bedId },
        data: { status: 'AVAILABLE' },
      });

      // 3. Update room occupancy status
      const totalBeds = await tx.bed.count({ where: { roomId: resident.roomId } });
      const occupiedBeds = await tx.bed.count({
        where: { roomId: resident.roomId, status: 'OCCUPIED' },
      });

      let roomStatus = 'AVAILABLE';
      if (occupiedBeds === totalBeds) {
        roomStatus = 'FULL';
      } else if (occupiedBeds > 0) {
        roomStatus = 'PARTIAL';
      }

      await tx.room.update({
        where: { id: resident.roomId },
        data: { status: roomStatus },
      });
    });

    // 4. Create notification
    await createNotification({
      type: 'RESIDENT_CHECKOUT',
      title: 'Resident Checked Out',
      message: `${resident.name} has checked out of Room ${resident.room.roomNumber}, Bed ${resident.bed.bedNumber}. Bed is now available.`,
      link: `/admin/residents/${resident.id}`,
    });

    return NextResponse.json({ success: true, message: 'Resident checked out successfully.' });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process resident checkout.' }, { status: 500 });
  }
}
