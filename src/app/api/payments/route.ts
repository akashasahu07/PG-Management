import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin, getAuthenticatedResident } from '@/lib/auth';
import { generateReceiptId } from '@/lib/id-generator';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const resident = await getAuthenticatedResident();

    if (!admin && !resident) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const residentParam = searchParams.get('residentId');
    const month = searchParams.get('month'); // 1 - 12
    const year = searchParams.get('year'); // e.g. 2026

    // Security: If resident is requesting, force filter to their own resident record!
    const effectiveResidentId = resident ? resident.id : (residentParam || undefined);

    const payments = await prisma.payment.findMany({
      where: {
        AND: [
          effectiveResidentId ? { residentId: effectiveResidentId } : {},
          status ? { status: status.toUpperCase() } : {},
        ],
      },
      include: {
        resident: {
          include: {
            room: { include: { floor: true } },
            bed: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Optional month/year in-memory filtering if dates need exact matching
    let filtered = payments;
    if (month && year) {
      filtered = filtered.filter((p) => {
        const d = new Date(p.paymentDate);
        return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
      });
    }

    return NextResponse.json({ payments: filtered });
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Admin authorization required to record payments.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      residentId,
      amount,
      paymentDate,
      billingStartDate,
      billingEndDate,
      paymentMethod,
      transactionRef,
      receiptNotes,
      status = 'PAID',
    } = body;

    if (!residentId || !amount || !paymentDate || !billingStartDate || !billingEndDate || !paymentMethod) {
      return NextResponse.json({ error: 'All payment fields are required.' }, { status: 400 });
    }

    const currentYear = new Date(paymentDate).getFullYear();
    const totalPaymentsCount = await prisma.payment.count();
    const paymentId = generateReceiptId(currentYear, totalPaymentsCount + 1);

    const payment = await prisma.payment.create({
      data: {
        paymentId,
        residentId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        billingStartDate: new Date(billingStartDate),
        billingEndDate: new Date(billingEndDate),
        paymentMethod: paymentMethod.toUpperCase(),
        transactionRef: transactionRef ? transactionRef.trim() : null,
        status: status.toUpperCase(),
        receiptNotes: receiptNotes ? receiptNotes.trim() : null,
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

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 });
  }
}
