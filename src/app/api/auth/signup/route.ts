import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { connectDB } from '@/lib/db';
import { signupSchema } from '@/lib/validators';
import { UserModel } from '@/models/User';
import { createToken, setAuthCookie, toSafeUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse({
      ...body,
      skills: Array.isArray(body.skills)
        ? body.skills
        : typeof body.skills === 'string'
          ? body.skills
              .split(',')
              .map((skill: string) => skill.trim())
              .filter(Boolean)
          : []
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await connectDB();

    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Account already exists with this email.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      name: data.name,
      company: data.company,
      skills: data.skills ?? [],
      experience: data.experience,
      preferredRole: data.preferredRole,
      preferredLocation: data.preferredLocation
    });

    const safeUser = toSafeUser(user);
    const token = createToken({ id: safeUser!.id, role: safeUser!.role });
    setAuthCookie(token);

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Signup error', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
