import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin, getAuthenticatedResident } from '@/lib/auth';

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    return NextResponse.json({
      role: 'ADMIN',
      user: admin,
    });
  }

  const resident = await getAuthenticatedResident();
  if (resident) {
    return NextResponse.json({
      role: 'RESIDENT',
      user: {
        id: resident.id,
        residentId: resident.residentId,
        name: resident.name,
        roomNumber: resident.room.roomNumber,
        bedNumber: resident.bed.bedNumber,
        floorName: resident.room.floor.displayName,
      },
    });
  }

  return NextResponse.json({ role: null, user: null }, { status: 401 });
}
