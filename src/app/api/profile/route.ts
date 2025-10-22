import { NextResponse } from 'next/server';

import { getCurrentUser, toSafeUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { profileUpdateSchema } from '@/lib/validators';
import { UserModel } from '@/models/User';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse({
      ...body,
      skills: Array.isArray(body.skills)
        ? body.skills
        : typeof body.skills === 'string'
          ? body.skills
              .split(',')
              .map((skill: string) => skill.trim())
              .filter(Boolean)
          : undefined
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid profile data' },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await UserModel.findByIdAndUpdate(user.id, parsed.data, { new: true, runValidators: true });
    const safeUser = toSafeUser(updated);

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Profile update error', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
