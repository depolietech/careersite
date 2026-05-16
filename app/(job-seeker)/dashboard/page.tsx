import { Briefcase, FileCheck, Calendar, Clock, ArrowRight, TrendingUp, CheckCircle2, XCircle, Eye, Sparkles, AlertCircle, MapPin } from "lucide-react";
import { DashboardRefresher } from "@/components/shared/DashboardRefresher";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getServerLocale, createServerT } from "@/lib/i18n/server";
import { scoreJobForSeeker } from "@/lib/matching";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  PENDING:             "default",
  REVIEWING:           "info",
  SHORTLISTED:         "success",
  FORWARDED:           "info",
  INTERVIEW_SCHEDULED: "success",
  REJECTED:            "danger",
  OFFER_MADE:          "success",
  HIRED:               "success",
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

function getStatusLabel(t: (k: string) => string, status: string): string {
  const map: Record<string, string> = {
    responded:           "Responded",
    PENDING:             t("status.applied"),
    REVIEWING:           t("status.underReview"),
    SHORTLISTED:         t("status.shortlisted"),
    FORWARDED:           t("status.forwarded"),
    INTERVIEW_SCHEDULED: t("status.interviewStage"),
    REJECTED:            t("status.notSelected"),
    OFFER_MADE:          t("status.offer"),
    HIRED:               t("status.hired"),
  };
  return map[status] ?? status;
}

export default async function JobSeekerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const t = createServerT(locale);

  const params = await searchParams;
  const filterStatus = params.status ?? null;

  const RESPONDED_STATUSES = ["REVIEWING", "SHORTLISTED", "FORWARDED", "INTERVIEW_SCHEDULED", "REJECTED", "OFFER_MADE", "HIRED"];

  const [allApps, filteredApps, profile, resumeCount, analyticsApps, activeJobs, appliedJobIds] = await Promise.all([
    db.application.findMany({
      where: { userId: session.user.id },
      select: { status: true },
    }),
    db.application.findMany({
      where: {
        userId: session.user.id,
        ...(filterStatus === "responded"
          ? { status: { in: RESPONDED_STATUSES } }
          : filterStatus
          ? { status: filterStatus }
          : {}),
      },
      include: {
        job: {
          select: {
            title: true, location: true, jobType: true, status: true, pipelineStatus: true,
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
      include: {
        workExperiences: true,
        educations: true,
        certifications: { select: { name: true, verificationLevel: true } },
      },
    }),
    db.resume.count({ where: { userId: session.user.id } }),
    db.application.findMany({
      where: { userId: session.user.id },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
        job: { select: { skills: true } },
      },
    }),
    db.job.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true, title: true, location: true, jobType: true,
        skills: true, experience: true, certificateRequired: true,
        employerProfile: { select: { industry: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    db.application.findMany({
      where: { userId: session.user.id },
      select: { jobId: true },
    }),
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
    if (!profile) return t("dashboard.createProfile");
    let skills: string[] = [];
    try { skills = JSON.parse(profile.skills); } catch { /* empty */ }
    const missing: string[] = [];
    if (skills.length === 0)                missing.push(t("profile.skills").toLowerCase());
    if (profile.workExperiences.length === 0) missing.push(t("profile.experience").toLowerCase());
    if (!profile.headline)                  missing.push(t("profile.headline").toLowerCase());
    if (!profile.summary)                   missing.push(t("profile.summary").toLowerCase());
    if (resumeCount === 0)                  missing.push(t("profile.resumes").toLowerCase());
    if (missing.length === 0) return t("dashboard.profileComplete");
    return `${t("profile.addSkill").replace("Add a skill", "Add")} ${missing.slice(0, 2).join(" & ")} to strengthen your profile`;
  }

  const completion = calcCompletion();

  // ── Top matches ────────────────────────────────────────────────────────────
  const appliedSet = new Set(appliedJobIds.map((a) => a.jobId));
  const topMatches = profile
    ? activeJobs
        .filter((j) => !appliedSet.has(j.id))
        .map((job) => ({
          job,
          ...scoreJobForSeeker(
            job,
            {
              ...profile,
              workExperiences: profile.workExperiences.map((w) => ({ skills: w.skills })),
              certifications: profile.certifications,
              educations: profile.educations,
            },
            resumeCount
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    : [];

  // Aggregate skill gaps and cert recommendations across top matches (most frequent first)
  const gapFreq: Record<string, number> = {};
  const certFreq: Record<string, number> = {};
  for (const m of topMatches) {
    for (const g of m.skillGaps) gapFreq[g] = (gapFreq[g] ?? 0) + 1;
    for (const c of m.certRecommendations) certFreq[c] = (certFreq[c] ?? 0) + 1;
  }
  const topSkillGaps = Object.entries(gapFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([s]) => s);
  const topCertRecs = Object.entries(certFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([c]) => c);

  // Application analytics
  const responded = analyticsApps.filter((a) =>
    ["REVIEWING", "SHORTLISTED", "FORWARDED", "INTERVIEW_SCHEDULED", "REJECTED", "OFFER_MADE", "HIRED"].includes(a.status)
  );
  const responseRate = analyticsApps.length > 0
    ? Math.round((responded.length / analyticsApps.length) * 100)
    : 0;

  const responseTimes = responded
    .map((a) => {
      const ms = new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime();
      return Math.round(ms / 86400000); // convert to days
    })
    .filter((d) => d >= 0 && d < 365);
  const avgResponseDays = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((s, d) => s + d, 0) / responseTimes.length)
    : null;

  const skillFreq: Record<string, number> = {};
  for (const a of analyticsApps) {
    let skills: string[] = [];
    try { skills = JSON.parse(a.job.skills ?? "[]"); } catch { /* ignore */ }
    for (const s of skills) skillFreq[s] = (skillFreq[s] ?? 0) + 1;
  }
  const topSkills = Object.entries(skillFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const counts = {
    total:       allApps.length,
    interviews:  allApps.filter((a) => a.status === "INTERVIEW_SCHEDULED").length,
    shortlisted: allApps.filter((a) => a.status === "SHORTLISTED" || a.status === "OFFER_MADE").length,
    pending:     allApps.filter((a) => a.status === "PENDING").length,
  };

  const stats = [
    { label: t("status.applied"),         value: counts.total,       icon: FileCheck,  color: "text-brand-600 bg-brand-50", status: null },
    { label: t("status.interviewStage"),  value: counts.interviews,  icon: Calendar,   color: "text-green-600 bg-green-50", status: "INTERVIEW_SCHEDULED" },
    { label: t("status.shortlisted"),     value: counts.shortlisted, icon: TrendingUp, color: "text-amber-600 bg-amber-50", status: "SHORTLISTED" },
    { label: t("status.pending"),         value: counts.pending,     icon: Clock,      color: "text-gray-600 bg-gray-50",   status: "PENDING" },
  ];

  const PIPELINE_LABELS: Record<string, string> = {
    OPEN:            "Actively Hiring",
    IN_REVIEW:       "Reviewing Applications",
    INTERVIEW_STAGE: "Interview Stage",
    FILLED:          "Position Filled",
    CLOSED:          "Closed",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <DashboardRefresher />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.myApplications")}</h1>
          <p className="text-gray-500 mt-1">{t("dashboard.recentActivity")}</p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          {t("dashboard.browseJobs")} <ArrowRight size={16} />
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
          <h2 className="font-semibold text-gray-900">{t("dashboard.profileStrength")}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-brand-600">{completion}%</span>
            <Link href="/profile" className="text-sm text-brand-600 hover:underline">{t("employer.editProfile")}</Link>
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

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-500" />
              <h2 className="font-semibold text-gray-900">Top Matches For You</h2>
            </div>
            <Link href="/jobs" className="text-sm text-brand-600 hover:underline">
              Browse all <ArrowRight size={13} className="inline" />
            </Link>
          </div>

          <div className="space-y-3">
            {topMatches.map(({ job, score, matchedSkills, skillGaps }) => {
              const scoreColor =
                score >= 80 ? "bg-green-100 text-green-700" :
                score >= 60 ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-600";
              return (
                <Link
                  key={job.id}
                  href={`/jobs?job=${job.id}`}
                  className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50 transition-all"
                >
                  <div className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${scoreColor}`}>
                    {score}%
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} />
                      {job.location} · {job.jobType}
                      {job.employerProfile?.industry ? ` · ${job.employerProfile.industry}` : ""}
                    </p>
                    {matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {matchedSkills.slice(0, 4).map((s) => (
                          <span key={s} className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            ✓ {s}
                          </span>
                        ))}
                        {skillGaps.slice(0, 2).map((s) => (
                          <span key={s} className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                            + {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Skill Gaps + Cert Recommendations panel */}
          {(topSkillGaps.length > 0 || topCertRecs.length > 0) && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-3">
              {topSkillGaps.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
                    <AlertCircle size={14} /> Skills to add to improve your matches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {topSkillGaps.map((s) => (
                      <span key={s} className="inline-flex rounded-full border border-amber-200 bg-white px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {topCertRecs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-700">Certifications that could boost your score</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topCertRecs.map((c) => (
                      <span key={c} className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        🏅 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Link href="/profile" className="text-xs text-amber-700 underline underline-offset-2 hover:no-underline">
                Update your profile →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Application Analytics */}
      {analyticsApps.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Application Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard?status=responded"
              className={`rounded-xl bg-brand-50 border border-brand-100 p-4 hover:shadow-card-hover transition-all block ${filterStatus === "responded" ? "ring-2 ring-brand-500" : ""}`}
            >
              <p className="text-xs text-gray-500 mb-1">Response rate</p>
              <p className="text-2xl font-bold text-brand-700">{responseRate}%</p>
              <p className="text-xs text-gray-400 mt-0.5">{responded.length} of {analyticsApps.length} applications got a reply</p>
            </Link>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Avg. recruiter response</p>
              <p className="text-2xl font-bold text-amber-700">
                {avgResponseDays !== null ? `${avgResponseDays}d` : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {avgResponseDays !== null ? "average days to first response" : "no responses yet"}
              </p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-100 p-4">
              <p className="text-xs text-gray-500 mb-2">Top skills in your matches</p>
              {topSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {topSkills.map((s) => (
                    <Link key={s} href={`/jobs?skill=${encodeURIComponent(s)}`} className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors" title={`Search jobs requiring ${s}`}>
                      {s}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No skill data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {filterStatus
                ? `${getStatusLabel(t, filterStatus)} Applications`
                : t("dashboard.myApplications")}
            </h2>
            {filterStatus && (
              <Link href="/dashboard" className="text-xs text-gray-400 underline hover:text-gray-600">
                Clear filter
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-400">{t("employer.candidateMasked")}</p>
        </div>

        {filteredApps.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <Briefcase size={32} className="mx-auto text-gray-300" />
            <p className="font-medium text-gray-500">
              {t("dashboard.noApplications")}
            </p>
            <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
              {t("dashboard.browseJobs")} <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => {
              const s = { label: getStatusLabel(t, app.status), variant: STATUS_VARIANT[app.status] ?? "default" as const };
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
                      {app.job.pipelineStatus && app.job.pipelineStatus !== "OPEN" && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Job stage: <span className="font-medium text-gray-600">{PIPELINE_LABELS[app.job.pipelineStatus] ?? app.job.pipelineStatus}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <Badge variant={s.variant}>{s.label}</Badge>
                    <Link
                      href={`/applications/${app.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      <Eye size={12} /> View Submission
                    </Link>
                    {app.status === "INTERVIEW_SCHEDULED" && app.interview?.meetingLink && (
                      <a
                        href={app.interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
                      >
                        <Calendar size={12} /> {t("interview.accept")}
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
