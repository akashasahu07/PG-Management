import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const AUTH_SECRET = process.env.AUTH_SECRET || 'elite_homes_jwt_secret_key_2026_super_secure';
export const ADMIN_COOKIE_NAME = 'elite_admin_token';
export const RESIDENT_COOKIE_NAME = 'elite_resident_token';

export interface AdminPayload {
  adminId: string;
  username: string;
  role: string;
}

export interface ResidentPayload {
  residentDbId: string;
  residentId: string;
  name: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function signResidentToken(payload: ResidentPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '30d' });
}

export function verifyResidentToken(token: string): ResidentPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as ResidentPayload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to verify admin session from cookies
 */
export async function getAuthenticatedAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAdminToken(token);
  if (!payload) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    select: { id: true, username: true, name: true, role: true },
  });

  return admin;
}

/**
 * Server-side helper to verify resident session from cookies
 */
export async function getAuthenticatedResident() {
  const cookieStore = cookies();
  const token = cookieStore.get(RESIDENT_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyResidentToken(token);
  if (!payload) return null;

  const resident = await prisma.resident.findUnique({
    where: { id: payload.residentDbId },
    include: {
      room: { include: { floor: true } },
      bed: true,
    },
  });

  if (!resident || resident.status !== 'ACTIVE') {
    return null;
  }

  return resident;
}
