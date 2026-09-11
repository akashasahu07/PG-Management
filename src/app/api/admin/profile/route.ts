import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Admin profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin profile.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, username, currentPassword, newPassword } = await req.json();

    const dbAdmin = await prisma.admin.findUnique({
      where: { id: admin.id },
    });

    if (!dbAdmin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    // If changing password or username, verify current password
    if (newPassword || username) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to update security credentials.' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, dbAdmin.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Incorrect current password.' },
          { status: 400 }
        );
      }
    }

    let passwordHash = dbAdmin.passwordHash;
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(username && { username: username.trim().toLowerCase() }),
        passwordHash,
      },
      select: { id: true, username: true, name: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully!',
      admin: updated,
    });
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json({ error: 'Failed to update credentials.' }, { status: 500 });
  }
}
