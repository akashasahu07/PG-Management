import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const floors = await prisma.floor.findMany({
      orderBy: { floorNumber: 'asc' },
      include: {
        rooms: {
          orderBy: { roomNumber: 'asc' },
          include: {
            beds: {
              orderBy: { bedNumber: 'asc' },
              include: {
                resident: {
                  select: {
                    id: true,
                    residentId: true,
                    name: true,
                    phone: true,
                    monthlyRent: true,
                    joiningDate: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ floors });
  } catch (error) {
    console.error('Floors fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch floors data.' }, { status: 500 });
  }
}
