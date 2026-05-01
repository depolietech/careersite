import Link from "next/link";
import { Users, Briefcase, MoreVertical, Plus, Calendar, Activity, ArrowRight, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  DRAFT:  "bg-orange-500 text-white",
  ACTIVE: "bg-brand-500 text-white",
  PAUSED: "bg-yellow-500 text-white",
  CLOSED: "bg-gray-400 text-white",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function EmployerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employerProfile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const jobs = await db.job.findMany({
    where: { postedById: session.user.id },
    include: {
      _count: { select: { applications: true } },
      applications: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const interviews = await db.interview.findMany({
    where: {
      scheduledAt: { gte: new Date() },
      application: { job: { postedById: session.user.id } },
    },
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  const recentApps = await db.application.findMany({
    where: { job: { postedById: session.user.id } },
    include: { job: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalApps      = jobs.reduce((s, j) => s + j._count.applications, 0);
  const totalShortlist = jobs.reduce((s, j) => s + j.applications.filter((a) => a.status === "SHORTLISTED").length, 0);
  const totalInterviews = jobs.reduce((s, j) => s + j.applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length, 0);

  const draftJobs = jobs.filter((j) => j.status === "DRAFT");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{employerProfile?.companyName ? `, ${employerProfile.companyName}` : ""}
        </h1>
        <p className="mt-1 text-gray-500">Who are we hiring today?</p>
      </div>

      {/* Stat cards — all linked */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <Link href="/employer/applicants" className="rounded-2xl bg-amber-50 border border-amber-100 p-5 hover:shadow-card-hover transition-all block">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-200">
              <Users size={16} className="text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Total Applicants</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">{totalApps}</span>
            <div className="flex -space-x-2">
              {[0,1,2,3,4].map((i) => <div key={i} className="h-8 w-8 rounded-full border-2 border-amber-50 bg-gray-300" />)}
            </div>
          </div>
        </Link>

        <Link href="/employer/calendar" className="rounded-2xl bg-purple-50 border border-purple-100 p-5 hover:shadow-card-hover transition-all block">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-200">
              <Calendar size={16} className="text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Interviews Scheduled</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">{totalInterviews}</span>
            <div className="flex -space-x-2">
              {[0,1,2,3,4].map((i) => <div key={i} className="h-8 w-8 rounded-full border-2 border-purple-50 bg-gray-400" />)}
            </div>
          </div>
        </Link>

        <div className="rounded-2xl bg-gray-100 border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-300">
              <TrendingUp size={16} className="text-gray-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {draftJobs.length > 0 ? "Draft Job Postings" : "Shortlisted Candidates"}
            </span>
          </div>
          {draftJobs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {draftJobs.slice(0, 2).map((job) => (
                <div key={job.id} className="rounded-xl bg-white border border-gray-200 p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-900 truncate">{job.title}</p>
                  <p className="text-[10px] text-gray-400">{job.jobType} · {job.location}</p>
                  <p className="flex items-center gap-1 text-[10px] text-orange-500 font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                    Draft
                  </p>
                  <Link
                    href="/employer/post-job"
                    className="block w-full rounded-md bg-brand-500 py-1.5 text-center text-[10px] font-semibold text-white hover:bg-brand-600 transition-colors"
                  >
                    Resume Posting
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end">
              <span className="text-4xl font-bold text-gray-900">{totalShortlist}</span>
            </div>
          )}
        </div>
      </div>

      {/* Jobs table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900">Your Jobs</span>
          </div>
          <Link
            href="/employer/post-job"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            <Plus size={14} /> Post a job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No jobs posted yet.{" "}
            <Link href="/employer/post-job" className="text-brand-600 hover:underline">Post your first job</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job) => {
              const interviewed = job.applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
              const shortlisted = job.applications.filter((a) => a.status === "SHORTLISTED").length;
              return (
                <Link key={job.id} href={`/employer/applicants/${job.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{job.jobType} · {job.location}</p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[job.status] ?? "bg-gray-200 text-gray-700"}`}>
                    {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                  </span>
                  <div className="hidden md:flex items-center gap-8 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{job._count.applications}</p>
                      <p className="text-[11px] text-gray-400">Applications</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{interviewed}</p>
                      <p className="text-[11px] text-gray-400">Interviewed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{shortlisted}</p>
                      <p className="text-[11px] text-gray-400">Shortlisted</p>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400">
                    <MoreVertical size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-50">
          <Link href="/employer/post-job" className="text-sm font-medium text-brand-600 hover:underline">
            Post another job +
          </Link>
        </div>
      </div>

      {/* Interviews + Activities */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-900">Upcoming Interviews</span>
            </div>
            <Link
              href="/employer/calendar"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              title="View calendar"
            >
              <Plus size={14} />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No upcoming interviews. Schedule one from the applicants page.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Date", "Time", "Activity", "Link"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interviews.map((iv) => (
                  <tr key={iv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-xs">{formatDate(iv.scheduledAt)}</p>
                      <p className="text-xs text-gray-400">{iv.scheduledAt.toLocaleDateString("en-US", { weekday: "short" })}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatTime(iv.scheduledAt)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs">
                        <Link
                          href={`/employer/applicants/${iv.application.job.id}`}
                          className="font-semibold text-brand-600 hover:underline"
                        >
                          {iv.application.job.title}
                        </Link>
                      </p>
                      <span className="mt-1 inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                        {iv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {iv.meetingLink ? (
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline"
                        >
                          Join
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="px-6 py-3 border-t border-gray-50">
            <Link href="/employer/calendar" className="text-sm font-medium text-brand-600 hover:underline">
              View all interviews +
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-900">Recent Activity</span>
            </div>
            <Link
              href="/employer/notifications"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-xs">No recent activity</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentApps.map((app) => (
                <Link key={app.id} href={`/employer/applicants/${app.job.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <Users size={12} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      New application for{" "}
                      <span className="font-semibold text-brand-600">{app.job.title}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
