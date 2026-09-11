import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const inputUser = String(username).trim();
    const cleanUserLower = inputUser.toLowerCase();

    // 1. Try finding admin by username (lowercase or raw) or name
    let admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: cleanUserLower },
          { username: inputUser },
          { name: inputUser },
        ],
      },
    });

    // 2. Fallback: check across registered admin accounts case-insensitively
    if (!admin) {
      const allAdmins = await prisma.admin.findMany();
      admin =
        allAdmins.find(
          (a) =>
            a.username.toLowerCase() === cleanUserLower ||
            a.name.toLowerCase() === cleanUserLower
        ) || null;
    }

    if (!admin) {
      return NextResponse.json(
        { error: `No admin account found matching "${inputUser}". Please check your username.` },
        { status: 401 }
      );
    }

    // 3. Verify password (try raw input first, then trimmed input)
    const inputPass = String(password);
    let isMatch = await bcrypt.compare(inputPass, admin.passwordHash);
    if (!isMatch && inputPass.trim() !== inputPass) {
      isMatch = await bcrypt.compare(inputPass.trim(), admin.passwordHash);
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify your password or use Reset Master Password below.' },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
