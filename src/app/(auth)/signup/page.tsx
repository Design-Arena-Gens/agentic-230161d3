'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

import { useAuth } from '@/context/AuthContext';

type Role = 'employer' | 'seeker';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [details, setDetails] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employer' as Role,
    company: '',
    skills: '',
    experience: '',
    preferredRole: '',
    preferredLocation: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmployer = useMemo(() => details.role === 'employer', [details.role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup({
        email: details.email,
        password: details.password,
        role: details.role,
        name: details.name,
        company: isEmployer ? details.company : undefined,
        skills: !isEmployer
          ? details.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean)
          : undefined,
        experience: !isEmployer ? details.experience : undefined,
        preferredRole: !isEmployer ? details.preferredRole : undefined,
        preferredLocation: !isEmployer ? details.preferredLocation : undefined
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white/5 shadow-xl ring-1 ring-white/10 backdrop-blur">
        <div className="grid gap-0 md:grid-cols-5">
          <div className="hidden flex-col justify-between bg-white/5 p-8 md:flex md:col-span-2">
            <div>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
                TalentBridge
              </span>
              <h1 className="mt-6 text-3xl font-semibold text-white">Create your free account</h1>
              <p className="mt-3 text-sm text-slate-200/80">
                Employers distribute roles across channels. Job seekers get a curated board tailored to their profile.
              </p>
            </div>
            <p className="text-sm text-slate-200/70">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-200 hover:text-indigo-100">
                Sign in
              </Link>
            </p>
          </div>

          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4 p-8">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setDetails((prev) => ({ ...prev, role: 'employer' }))}
                  className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    isEmployer
                      ? 'border-indigo-400/60 bg-indigo-400/20 text-white'
                      : 'border-white/10 bg-white/5 text-slate-200/70 hover:border-white/20'
                  }`}
                >
                  I&apos;m hiring
                </button>
                <button
                  type="button"
                  onClick={() => setDetails((prev) => ({ ...prev, role: 'seeker' }))}
                  className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    !isEmployer
                      ? 'border-indigo-400/60 bg-indigo-400/20 text-white'
                      : 'border-white/10 bg-white/5 text-slate-200/70 hover:border-white/20'
                  }`}
                >
                  I&apos;m seeking jobs
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-100">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={details.name}
                    onChange={(event) => setDetails((prev) => ({ ...prev, name: event.target.value }))}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="Alex Morgan"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-100">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={details.email}
                    onChange={(event) => setDetails((prev) => ({ ...prev, email: event.target.value }))}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={details.password}
                    onChange={(event) => setDetails((prev) => ({ ...prev, password: event.target.value }))}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    placeholder="Create a strong password"
                  />
                </div>

                {isEmployer ? (
                  <div className="md:col-span-2">
                    <label htmlFor="company" className="block text-sm font-medium text-slate-100">
                      Company name
                    </label>
                    <input
                      id="company"
                      value={details.company}
                      onChange={(event) => setDetails((prev) => ({ ...prev, company: event.target.value }))}
                      required
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                      placeholder="Acme Corp"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-slate-100">
                        Core skills
                      </label>
                      <input
                        id="skills"
                        value={details.skills}
                        onChange={(event) => setDetails((prev) => ({ ...prev, skills: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                        placeholder="React, Node.js, PostgreSQL"
                      />
                      <p className="mt-1 text-xs text-slate-300/70">Comma separated</p>
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-slate-100">
                        Experience summary
                      </label>
                      <textarea
                        id="experience"
                        value={details.experience}
                        onChange={(event) => setDetails((prev) => ({ ...prev, experience: event.target.value }))}
                        className="mt-1 h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                        placeholder="5 years building SaaS platforms with modern stacks"
                      />
                    </div>

                    <div>
                      <label htmlFor="preferredRole" className="block text-sm font-medium text-slate-100">
                        Preferred role
                      </label>
                      <input
                        id="preferredRole"
                        value={details.preferredRole}
                        onChange={(event) => setDetails((prev) => ({ ...prev, preferredRole: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                        placeholder="Full-stack engineer"
                      />
                    </div>

                    <div>
                      <label htmlFor="preferredLocation" className="block text-sm font-medium text-slate-100">
                        Preferred location
                      </label>
                      <input
                        id="preferredLocation"
                        value={details.preferredLocation}
                        onChange={(event) => setDetails((prev) => ({ ...prev, preferredLocation: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                        placeholder="Remote (US)"
                      />
                    </div>
                  </>
                )}
              </div>

              {error && <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>

              <p className="text-center text-sm text-slate-200/80 md:hidden">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-indigo-200 hover:text-indigo-100">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
