import { Briefcase, FileCheck, Calendar, Clock, ArrowRight, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "success" | "warning" | "info" | "danger" }> = {
  PENDING:             { label: "Applied",         variant: "default" },
  REVIEWING:           { label: "Under Review",    variant: "info" },
  SHORTLISTED:         { label: "Shortlisted",     variant: "success" },
  FORWARDED:           { label: "Forwarded",       variant: "info" },
  INTERVIEW_SCHEDULED: { label: "Interview Stage", variant: "success" },
  REJECTED:            { label: "Not Selected",    variant: "danger" },
  OFFER_MADE:          { label: "Offer!",          variant: "success" },
  HIRED:               { label: "Hired",           variant: "success" },
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
}

export default async function JobSeekerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const filterStatus = params.status ?? null;

  const [allApps, filteredApps, profile, resumeCount] = await Promise.all([
    db.application.findMany({
      where: { userId: session.user.id },
      select: { status: true },
    }),
    db.application.findMany({
      where: {
        userId: session.user.id,
        ...(filterStatus ? { status: filterStatus } : {}),
      },
      include: {
        job: {
          select: {
            title: true, location: true, jobType: true, status: true,
            employerProfile: { select: { industry: true } },
          },
        },
        interview: { select: { scheduledAt: true, meetingLink: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      include: { workExperiences: true, educations: true },
    }),
    db.resume.count({ where: { userId: session.user.id } }),
  ]);

  // Weighted profile completion (sums to 100)
  function calcCompletion(): number {
    if (!profile) return 0;
    let score = 0;
    let skills: string[] = [];
    try { skills = JSON.parse(profile.skills); } catch { /* empty */ }
    if (profile.firstName && profile.lastName)       score += 10;
    if (profile.headline)                            score += 10;
    if (profile.summary)                             score += 10;
    if (skills.length > 0)                           score += 15;
    if ((profile.yearsExperience ?? 0) > 0)          score += 10;
    if (profile.jobType)                             score +=  5;
    if (profile.location)                            score +=  5;
    if (profile.workExperiences.length > 0)          score += 20;
    if (profile.educations.length > 0)               score += 10;
    if (resumeCount > 0)                             score +=  5;
    return score;
  }

  function completionHint(): string {
    if (!profile) return "Create your profile to start applying";
    let skills: string[] = [];
    try { skills = JSON.parse(profile.skills); } catch { /* empty */ }
    const missing: string[] = [];
    if (skills.length === 0)                missing.push("skills");
    if (profile.workExperiences.length === 0) missing.push("work experience");
    if (!profile.headline)                  missing.push("a headline");
    if (!profile.summary)                   missing.push("a summary");
    if (resumeCount === 0)                  missing.push("a resume");
    if (missing.length === 0) return "Profile complete — you're ready to apply!";
    return `Add ${missing.slice(0, 2).join(" and ")} to strengthen your profile`;
  }

  const completion = calcCompletion();

  const counts = {
    total:       allApps.length,
    interviews:  allApps.filter((a) => a.status === "INTERVIEW_SCHEDULED").length,
    shortlisted: allApps.filter((a) => a.status === "SHORTLISTED" || a.status === "OFFER_MADE").length,
    pending:     allApps.filter((a) => a.status === "PENDING").length,
  };

  const stats = [
    { label: "Applications", value: counts.total,       icon: FileCheck,  color: "text-brand-600 bg-brand-50", status: null },
    { label: "Interviews",   value: counts.interviews,  icon: Calendar,   color: "text-green-600 bg-green-50", status: "INTERVIEW_SCHEDULED" },
    { label: "Shortlisted",  value: counts.shortlisted, icon: TrendingUp, color: "text-amber-600 bg-amber-50", status: "SHORTLISTED" },
    { label: "Pending",      value: counts.pending,     icon: Clock,      color: "text-gray-600 bg-gray-50",   status: "PENDING" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your applications and job activity</p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Browse Jobs <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => {
          const href = s.status ? `/dashboard?status=${s.status}` : "/dashboard";
          const isActive = filterStatus === s.status || (!filterStatus && s.status === null);
          return (
            <Link
              key={s.label}
              href={href}
              className={`card p-5 flex items-center gap-4 transition-all hover:shadow-card-hover ${
                isActive ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Profile completeness */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Profile completeness</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-brand-600">{completion}%</span>
            <Link href="/profile" className="text-sm text-brand-600 hover:underline">Edit profile</Link>
          </div>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">{completionHint()}</p>
      </div>

      {/* Application list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {filterStatus
                ? `${STATUS_BADGE[filterStatus]?.label ?? filterStatus} Applications`
                : "All Applications"}
            </h2>
            {filterStatus && (
              <Link href="/dashboard" className="text-xs text-gray-400 underline hover:text-gray-600">
                Clear filter
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-400">Identity masked until interview</p>
        </div>

        {filteredApps.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <Briefcase size={32} className="mx-auto text-gray-300" />
            <p className="font-medium text-gray-500">
              {filterStatus ? "No applications with this status yet" : "No applications yet"}
            </p>
            <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
              Browse open jobs <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => {
              const s = STATUS_BADGE[app.status] ?? { label: app.status, variant: "default" as const };
              const jobClosed = app.job.status === "CLOSED" || app.job.status === "PAUSED";
              return (
                <div key={app.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{app.job.title}</p>
                        {jobClosed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-medium">
                            <XCircle size={11} /> Job Closed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {app.job.employerProfile?.industry ?? "Company"} · {app.job.location} · Applied {timeAgo(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={s.variant}>{s.label}</Badge>
                    {app.status === "INTERVIEW_SCHEDULED" && app.interview?.meetingLink && (
                      <a
                        href={app.interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
                      >
                        <Calendar size={12} /> Join Interview
                      </a>
                    )}
                    {app.status === "INTERVIEW_SCHEDULED" && !app.interview?.meetingLink && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <CheckCircle2 size={13} /> Interview confirmed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
