import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { jobCreateSchema, jobQuerySchema } from '@/lib/validators';
import { JobModel } from '@/models/Job';
import { ApplicationModel } from '@/models/Application';

function normalizeSkills(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((skill) => String(skill).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

function formatJob(job: any, applicationCount = 0) {
  return {
    id: job._id?.toString?.() ?? job.id,
    title: job.title,
    description: job.description,
    skills: job.skills ?? [],
    location: job.location,
    salary: job.salary,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    employer: job.employer
      ? {
          id: job.employer._id?.toString?.() ?? job.employer.id,
          name: job.employer.name,
          company: job.employer.company
        }
      : null,
    applicationCount
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = jobQuerySchema.safeParse({
      search: rawQuery.search,
      location: rawQuery.location
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: parsedQuery.error.issues[0]?.message ?? 'Invalid search parameters' },
        { status: 400 }
      );
    }

    const mine = rawQuery.mine === 'true';
    await connectDB();

    const filter: Record<string, any> = {};
    if (parsedQuery.data.search) {
      const regex = new RegExp(parsedQuery.data.search, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { skills: regex }];
    }
    if (parsedQuery.data.location) {
      filter.location = new RegExp(parsedQuery.data.location, 'i');
    }

    if (mine) {
      const user = await getCurrentUser(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (user.role !== 'employer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      filter.employer = user.id;
    }

    const jobs = await JobModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('employer', 'name company')
      .lean();

    const jobIds = jobs.map((job) => job._id);

    const applicationCounts = new Map<string, number>();
    await Promise.all(
      jobIds.map(async (jobId) => {
        const count = await ApplicationModel.countDocuments({ job: jobId });
        applicationCounts.set(jobId.toString(), count);
      })
    );

    const formatted = jobs.map((job) => formatJob(job, applicationCounts.get(job._id.toString()) ?? 0));

    return NextResponse.json({ jobs: formatted });
  } catch (error) {
    console.error('Jobs GET error', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'employer') {
      return NextResponse.json({ error: 'Only employers can post jobs' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = jobCreateSchema.safeParse({
      ...body,
      skills: normalizeSkills(body.skills)
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid job data' },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await JobModel.create({
      ...parsed.data,
      employer: user.id
    });

    await job.populate('employer', 'name company');

    return NextResponse.json({ job: formatJob(job, 0) }, { status: 201 });
  } catch (error) {
    console.error('Jobs POST error', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
