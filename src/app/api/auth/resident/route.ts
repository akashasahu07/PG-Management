import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signResidentToken, RESIDENT_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { residentId } = await req.json();

    if (!residentId || typeof residentId !== 'string') {
      return NextResponse.json(
        { error: 'Please enter your Resident ID (e.g. EH-A07-001).' },
        { status: 400 }
      );
    }

    const cleanedId = residentId.trim().toUpperCase();

    const resident = await prisma.resident.findUnique({
      where: { residentId: cleanedId },
      include: {
        room: { include: { floor: true } },
        bed: true,
      },
    });

    if (!resident) {
      return NextResponse.json(
        { error: 'Resident ID not found. Please verify your ID or contact PG management.' },
        { status: 404 }
      );
    }

    if (resident.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This resident account is marked as checked out/inactive.' },
        { status: 403 }
      );
    }

    const token = signResidentToken({
      residentDbId: resident.id,
      residentId: resident.residentId,
      name: resident.name,
    });

    const response = NextResponse.json({
      success: true,
      resident: {
        id: resident.id,
        residentId: resident.residentId,
        name: resident.name,
        roomNumber: resident.room.roomNumber,
        bedNumber: resident.bed.bedNumber,
        floorName: resident.room.floor.displayName,
      },
    });

    response.cookies.set({
      name: RESIDENT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Resident login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Resident logged out.' });
  response.cookies.set({
    name: RESIDENT_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
