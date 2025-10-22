import { NextRequest, NextResponse } from 'next/server';

import { applicationCreateSchema } from '@/lib/validators';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { JobModel } from '@/models/Job';
import { ApplicationModel } from '@/models/Application';

export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'seeker') {
      return NextResponse.json({ error: 'Only job seekers can apply' }, { status: 403 });
    }

    const jobId = params.jobId;
    await connectDB();

    const job = await JobModel.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = applicationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid application' },
        { status: 400 }
      );
    }

    try {
      await ApplicationModel.create({
        job: job._id,
        seeker: user.id,
        message: parsed.data.message
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        return NextResponse.json({ error: 'You have already applied to this job' }, { status: 409 });
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application error', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
