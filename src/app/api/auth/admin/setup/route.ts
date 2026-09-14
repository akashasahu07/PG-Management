import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst({
      select: { username: true, name: true },
    });
    return NextResponse.json({
      isSetup: !!admin,
      adminUsername: admin?.username || null,
      adminName: admin?.name || null,
    });
  } catch (error) {
    console.error('Check admin setup error:', error);
    return NextResponse.json({ error: 'Failed to verify admin status.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      return NextResponse.json(
        { error: 'Master Administrator account is already configured. Public setup is permanently locked.' },
        { status: 403 }
      );
    }

    const { name, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Full Name, Username, and Password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Master Administrator account created successfully!',
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
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
  } catch (error: any) {
    console.error('Admin setup error:', error);
    const detail = error?.message || 'Failed to create master admin account.';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
