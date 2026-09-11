import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin, getAuthenticatedResident } from '@/lib/auth';
import { generateTicketId } from '@/lib/id-generator';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const resident = await getAuthenticatedResident();

    if (!admin && !resident) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const complaints = await prisma.complaint.findMany({
      where: {
        AND: [
          // Security: residents only see their own tickets
          resident ? { residentId: resident.id } : {},
          status ? { status: status.toUpperCase() } : {},
          category ? { category } : {},
          priority ? { priority: priority.toUpperCase() } : {},
        ],
      },
      include: {
        resident: {
          include: {
            room: { include: { floor: true } },
            bed: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Complaints fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const resident = await getAuthenticatedResident();

    if (!admin && !resident) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { category, subject, description, priority = 'MEDIUM', residentId: explicitResidentId } = body;

    if (!category || !subject || !description) {
      return NextResponse.json({ error: 'Category, subject, and description are required.' }, { status: 400 });
    }

    // Determine target resident
    const targetResidentId = resident ? resident.id : explicitResidentId;
    if (!targetResidentId) {
      return NextResponse.json({ error: 'Resident ID is required.' }, { status: 400 });
    }

    const targetResident = await prisma.resident.findUnique({
      where: { id: targetResidentId },
      include: { room: true },
    });

    if (!targetResident) {
      return NextResponse.json({ error: 'Resident not found.' }, { status: 404 });
    }

    const currentYear = new Date().getFullYear();
    const totalComplaintsCount = await prisma.complaint.count();
    const ticketId = generateTicketId(currentYear, totalComplaintsCount + 1);

    const complaint = await prisma.$transaction(async (tx) => {
      const newComplaint = await tx.complaint.create({
        data: {
          ticketId,
          residentId: targetResident.id,
          category,
          subject: subject.trim(),
          description: description.trim(),
          priority: priority.toUpperCase(),
          status: 'SUBMITTED',
        },
        include: {
          resident: { include: { room: true } },
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: newComplaint.id,
          oldStatus: 'NONE',
          newStatus: 'SUBMITTED',
          comment: 'Complaint ticket created and submitted by resident.',
          changedBy: resident ? resident.name : (admin ? admin.name : 'System'),
        },
      });

      return newComplaint;
    });

    // Notify Admin
    await createNotification({
      type: 'NEW_COMPLAINT',
      title: 'New Complaint Submitted',
      message: `${targetResident.name} (Room ${targetResident.room.roomNumber}) submitted: "${complaint.subject}" [${complaint.ticketId}]`,
      link: `/admin/complaints`,
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error('Complaint create error:', error);
    return NextResponse.json({ error: 'Failed to create complaint ticket.' }, { status: 500 });
  }
}
