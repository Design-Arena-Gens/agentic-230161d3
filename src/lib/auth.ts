import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

import { connectDB } from './db';
import { UserModel, type UserRole } from '@/models/User';
import type { SafeUser } from '@/types/user';

const TOKEN_NAME = 'zipmvp_token';

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'development-secret';
  }
  return process.env.JWT_SECRET;
}

export function createToken(user: { id: string; role: UserRole }) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(token: string) {
  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie() {
  cookies().set(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export function getTokenFromRequest(req?: NextRequest) {
  if (req) {
    const cookie = req.cookies.get(TOKEN_NAME)?.value;
    if (cookie) return cookie;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (token) return token;

  const headerList = headers();
  const authHeader = headerList.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string; role: UserRole };
    return payload;
  } catch (error) {
    return null;
  }
}

export function toSafeUser(user: any): SafeUser | null {
  if (!user) return null;
  const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;
  return {
    id: plain._id?.toString?.() ?? plain.id,
    email: plain.email,
    role: plain.role,
    name: plain.name,
    company: plain.company,
    skills: plain.skills ?? [],
    experience: plain.experience,
    preferredRole: plain.preferredRole,
    preferredLocation: plain.preferredLocation,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
}

export async function getCurrentUser(req?: NextRequest): Promise<SafeUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await UserModel.findById(payload.sub).lean();
  if (!user) return null;

  return toSafeUser({ ...user, _id: user._id });
}

export async function requireCurrentUser(req?: NextRequest): Promise<SafeUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function ensureRole(user: SafeUser, role: UserRole) {
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
}
