import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { connectDB } from '@/lib/db';
import { loginSchema } from '@/lib/validators';
import { UserModel } from '@/models/User';
import { createToken, setAuthCookie, toSafeUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid credentials' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await connectDB();
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const safeUser = toSafeUser(user);
    if (!safeUser) {
      return NextResponse.json({ error: 'Unable to process user' }, { status: 500 });
    }

    const token = createToken({ id: safeUser.id, role: safeUser.role });
    setAuthCookie(token);

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
