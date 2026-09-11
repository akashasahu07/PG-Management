import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { newStatus, comment } = await req.json();

    if (!newStatus) {
      return NextResponse.json({ error: 'New status is required.' }, { status: 400 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id },
      include: { resident: { include: { room: true } } },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    const oldStatus = complaint.status;
    const isResolved = newStatus === 'RESOLVED' || newStatus === 'CLOSED';

    const updatedComplaint = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id: params.id },
        data: {
          status: newStatus.toUpperCase(),
          ...(isResolved && { resolvedAt: new Date() }),
        },
        include: {
          resident: { include: { room: true } },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          oldStatus,
          newStatus: newStatus.toUpperCase(),
          comment: comment ? comment.trim() : `Status transitioned to ${newStatus}.`,
          changedBy: admin.name || 'Admin',
        },
      });

      return updated;
    });

    await createNotification({
      type: 'COMPLAINT_STATUS',
      title: 'Complaint Status Updated',
      message: `Ticket ${complaint.ticketId} for ${complaint.resident.name} marked as ${newStatus}.`,
      link: `/admin/complaints`,
    });

    return NextResponse.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    console.error('Complaint status update error:', error);
    return NextResponse.json({ error: 'Failed to update complaint status.' }, { status: 500 });
  }
}
