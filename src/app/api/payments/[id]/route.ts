import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin, getAuthenticatedResident } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    const resident = await getAuthenticatedResident();

    if (!admin && !resident) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id: params.id }, { paymentId: params.id }],
      },
      include: {
        resident: {
          include: {
            room: { include: { floor: true } },
            bed: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
    }

    // Role-based security: A resident can only view their own payment receipt
    if (resident && payment.residentId !== resident.id) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment.' }, { status: 500 });
  }
}
