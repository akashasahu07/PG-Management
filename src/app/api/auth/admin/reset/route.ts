import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const inputUser = (username || '').trim().toLowerCase();

    // Find the master admin
    let admin = null;
    if (inputUser) {
      admin = await prisma.admin.findFirst({
        where: {
          OR: [
            { username: inputUser },
            { name: inputUser },
          ],
        },
      });
    }

    if (!admin) {
      // Default to the first and only master admin
      admin = await prisma.admin.findFirst();
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'No administrator account found in system to reset.' },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Master password has been reset successfully!',
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Admin password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset admin password.' },
      { status: 500 }
    );
  }
}
