import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { computeResidentRentStatus } from '@/lib/due-date';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    // Parallel fetch for optimal performance
    const [
      totalBeds,
      occupiedBeds,
      activeResidents,
      floors,
      openComplaintsCount,
      recentPayments,
      recentComplaints,
      allPayments,
    ] = await Promise.all([
      prisma.bed.count(),
      prisma.bed.count({ where: { status: 'OCCUPIED' } }),
      prisma.resident.findMany({
        where: { status: 'ACTIVE' },
        include: {
          room: true,
          payments: {
            orderBy: { paymentDate: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.floor.findMany({
        orderBy: { floorNumber: 'asc' },
        include: {
          rooms: {
            include: {
              beds: true,
            },
          },
        },
      }),
      prisma.complaint.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] } },
      }),
      prisma.payment.findMany({
        take: 6,
        orderBy: { paymentDate: 'desc' },
        include: { resident: { include: { room: true } } },
      }),
      prisma.complaint.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { resident: { include: { room: true } } },
      }),
      prisma.payment.findMany({
        where: { status: 'PAID' },
        select: { amount: true },
      }),
    ]);

    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : '0';

    // Calculate due today, overdue, and expected rent
    let rentDueTodayCount = 0;
    let rentOverdueCount = 0;
    let rentDueSoonCount = 0;
    let totalMonthlyRevenueExpected = 0;

    activeResidents.forEach((res) => {
      totalMonthlyRevenueExpected += res.monthlyRent;
      const latestPay = res.payments[0]?.paymentDate;
      const statusObj = computeResidentRentStatus(res.joiningDate, latestPay);

      if (statusObj.status === 'DUE_TODAY') rentDueTodayCount++;
      else if (statusObj.status === 'OVERDUE') rentOverdueCount++;
      else if (statusObj.status === 'DUE_SOON') rentDueSoonCount++;
    });

    const totalRevenueCollected = allPayments.reduce((acc, p) => acc + p.amount, 0);

    // Floor breakdown
    const floorBreakdown = floors.map((fl) => {
      let floorTotalBeds = 0;
      let floorOccupiedBeds = 0;

      fl.rooms.forEach((r) => {
        floorTotalBeds += r.beds.length;
        floorOccupiedBeds += r.beds.filter((b) => b.status === 'OCCUPIED').length;
      });

      const floorRate = floorTotalBeds > 0 ? Math.round((floorOccupiedBeds / floorTotalBeds) * 100) : 0;

      return {
        id: fl.id,
        code: fl.code,
        displayName: fl.displayName,
        totalBeds: floorTotalBeds,
        occupiedBeds: floorOccupiedBeds,
        availableBeds: floorTotalBeds - floorOccupiedBeds,
        occupancyRate: floorRate,
        roomCount: fl.rooms.length,
      };
    });

    return NextResponse.json({
      stats: {
        totalResidents: activeResidents.length,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate: Number(occupancyRate),
        rentDueTodayCount,
        rentOverdueCount,
        rentDueSoonCount,
        openComplaintsCount,
        totalMonthlyRevenueExpected,
        totalRevenueCollected,
      },
      floorBreakdown,
      recentPayments,
      recentComplaints,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to retrieve dashboard analytics.' }, { status: 500 });
  }
}
