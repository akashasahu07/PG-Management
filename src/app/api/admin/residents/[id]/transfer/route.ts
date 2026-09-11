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

    const { newRoomId, newBedId, reason } = await req.json();

    if (!newRoomId || !newBedId) {
      return NextResponse.json({ error: 'New Room and Bed must be specified.' }, { status: 400 });
    }

    const resident = await prisma.resident.findUnique({
      where: { id: params.id },
      include: { room: true, bed: true },
    });

    if (!resident || resident.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Active resident not found.' }, { status: 404 });
    }

    const newBed = await prisma.bed.findUnique({
      where: { id: newBedId },
      include: { room: true },
    });

    if (!newBed || newBed.roomId !== newRoomId) {
      return NextResponse.json({ error: 'Invalid target room and bed.' }, { status: 400 });
    }

    if (newBed.status === 'OCCUPIED') {
      return NextResponse.json({ error: 'Target bed is already occupied.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Log transfer history
      await tx.roomTransferHistory.create({
        data: {
          residentId: resident.id,
          oldRoomNumber: resident.room.roomNumber,
          oldBedNumber: resident.bed.bedNumber,
          newRoomNumber: newBed.room.roomNumber,
          newBedNumber: newBed.bedNumber,
          reason: reason || 'Internal PG transfer',
        },
      });

      // 2. Free old bed
      await tx.bed.update({
        where: { id: resident.bedId },
        data: { status: 'AVAILABLE' },
      });

      // 3. Occupy new bed
      await tx.bed.update({
        where: { id: newBedId },
        data: { status: 'OCCUPIED' },
      });

      // 4. Update resident record (and update rent to target room rent)
      await tx.resident.update({
        where: { id: resident.id },
        data: {
          roomId: newRoomId,
          bedId: newBedId,
          monthlyRent: newBed.room.monthlyRent,
        },
      });

      // 5. Update old room status
      const oldTotal = await tx.bed.count({ where: { roomId: resident.roomId } });
      const oldOccupied = await tx.bed.count({ where: { roomId: resident.roomId, status: 'OCCUPIED' } });
      let oldStatus = 'AVAILABLE';
      if (oldOccupied === oldTotal) oldStatus = 'FULL';
      else if (oldOccupied > 0) oldStatus = 'PARTIAL';
      await tx.room.update({ where: { id: resident.roomId }, data: { status: oldStatus } });

      // 6. Update new room status
      const newTotal = await tx.bed.count({ where: { roomId: newRoomId } });
      const newOccupied = await tx.bed.count({ where: { roomId: newRoomId, status: 'OCCUPIED' } });
      let newStatus = 'AVAILABLE';
      if (newOccupied === newTotal) newStatus = 'FULL';
      else if (newOccupied > 0) newStatus = 'PARTIAL';
      await tx.room.update({ where: { id: newRoomId }, data: { status: newStatus } });
    });

    // Create notification
    await createNotification({
      type: 'ROOM_AVAILABLE',
      title: 'Resident Room Transfer',
      message: `${resident.name} transferred from Room ${resident.room.roomNumber} (Bed ${resident.bed.bedNumber}) to Room ${newBed.room.roomNumber} (Bed ${newBed.bedNumber}).`,
      link: `/admin/residents/${resident.id}`,
    });

    return NextResponse.json({ success: true, message: 'Transfer completed successfully.' });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Failed to process room transfer.' }, { status: 500 });
  }
}
