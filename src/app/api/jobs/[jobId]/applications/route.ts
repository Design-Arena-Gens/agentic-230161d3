import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { JobModel } from '@/models/Job';
import { ApplicationModel } from '@/models/Application';

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'employer') {
      return NextResponse.json({ error: 'Only employers can view applicants' }, { status: 403 });
    }

    const jobId = params.jobId;

    await connectDB();

    const job = await JobModel.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.employer.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const applications = await ApplicationModel.find({ job: job._id })
      .sort({ createdAt: -1 })
      .populate('seeker', 'name email skills experience preferredRole preferredLocation')
      .lean();

    const formatted = applications.map((application) => ({
      id: application._id?.toString?.(),
      message: application.message,
      createdAt: application.createdAt,
      seeker: application.seeker
        ? {
            id: application.seeker._id?.toString?.(),
            name: application.seeker.name,
            email: application.seeker.email,
            skills: application.seeker.skills ?? [],
            experience: application.seeker.experience,
            preferredRole: application.seeker.preferredRole,
            preferredLocation: application.seeker.preferredLocation
          }
        : null
    }));

    return NextResponse.json({ applications: formatted });
  } catch (error) {
    console.error('Applications fetch error', error);
    return NextResponse.json({ error: 'Failed to load applicants' }, { status: 500 });
  }
}
