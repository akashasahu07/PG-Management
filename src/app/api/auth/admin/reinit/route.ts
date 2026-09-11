import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await prisma.admin.deleteMany();

    const response = NextResponse.json({
      success: true,
      message: 'Master administrator account cleared. You may now create a new master account from scratch.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Admin reinit error:', error);
    return NextResponse.json(
      { error: 'Failed to reset administrator account.' },
      { status: 500 }
    );
  }
}
