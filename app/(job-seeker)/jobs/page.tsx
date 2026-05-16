"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, MapPin, Briefcase, Clock, DollarSign, ArrowRight,
  CheckSquare, Square, CheckCircle2, XCircle, Loader2, Lock, Flag, X,
  FileText, AlertCircle, User, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSalary, timeAgo, locationToCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Job = {
  id: string;
  title: string;
  location: string;
  locations: string | null;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: number | null;
  skills: string;
  description: string;
  createdAt: string;
  pipelineStatus: string;
  shortlistedCount: number;
  interviewCount: number;
  employerProfile: { companyName: string; industry: string | null; companySize: string | null; verificationStatus: string } | null;
  _count: { applications: number };
};

type ApplyResult = { jobId: string; status: "ok" | "duplicate" | "error"; applicationId?: string; message?: string };

const PIPELINE_LABELS: Record<string, { label: string; cls: string }> = {
  OPEN:            { label: "Actively Hiring",          cls: "text-green-700 bg-green-50 border border-green-200" },
  IN_REVIEW:       { label: "Reviewing Applications",   cls: "text-amber-700 bg-amber-50 border border-amber-200" },
  INTERVIEW_STAGE: { label: "Interview Stage",          cls: "text-blue-700 bg-blue-50 border border-blue-200" },
  FILLED:          { label: "Position Filled",          cls: "text-gray-600 bg-gray-50 border border-gray-200" },
  CLOSED:          { label: "Closed",                   cls: "text-red-700 bg-red-50 border border-red-200" },
};

type Resume = { id: string; name: string; fileName: string; isDefault: boolean };

type ProfileStatus = {
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
};

function JobsPageInner() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const preselectedJobId = searchParams.get("job");
  const preselectedSkill = searchParams.get("skill");

  const JOB_TYPE_LABELS: Record<string, string> = {
    "full-time": t("jobs.fullTime"),
    "part-time": t("jobs.partTime"),
    "contract":  t("jobs.contract"),
    "remote":    t("jobs.remote"),
  };

  const NA_LOCATIONS = [
    { value: "",        label: t("jobs.allLocations") },
    { value: "Remote",  label: t("jobs.remote") },
    { value: "USA",     label: t("employer.locationUSA") },
    { value: "Canada",  label: t("employer.locationCanada") },
    { value: "Mexico",  label: t("employer.locationMexico") },
  ];

  const JOB_TYPES = [
    { value: "",          label: t("jobs.allTypes") },
    { value: "full-time", label: t("jobs.fullTime") },
    { value: "part-time", label: t("jobs.partTime") },
    { value: "contract",  label: t("jobs.contract") },
  ];

  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState("");
  const [location, setLocation]       = useState("");
  const [jobType, setJobType]         = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying]       = useState(false);
  const [bulkMode, setBulkMode]       = useState(false);
  const [results, setResults]         = useState<ApplyResult[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [toast, setToast]             = useState<{ message: string; ok: boolean } | null>(null);
  const [reporting, setReporting]     = useState(false);
  const [reportCategory, setReportCategory] = useState("FAKE_JOB");
  const [reportDesc, setReportDesc]   = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Profile completion + resume selection
  const [resumes, setResumes]               = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [profileStatus, setProfileStatus]   = useState<ProfileStatus | null>(null);
  const [profileCheckLoading, setProfileCheckLoading] = useState(false);
  const [appliedAppIds, setAppliedAppIds]   = useState<Map<string, string>>(new Map()); // jobId → applicationId

  const isLoggedIn = authStatus === "authenticated";

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query)    params.set("q", query);
    if (location) params.set("location", location);
    if (jobType)  params.set("type", jobType);
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data: Job[] = await res.json();
    setJobs(data);
    setLoading(false);
  }, [query, location, jobType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  // Pre-fill skill search from ?skill= URL param
  useEffect(() => {
    if (preselectedSkill && !query) setQuery(preselectedSkill);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedSkill]);

  // Auto-select a job when arriving from landing page via ?job=ID
  useEffect(() => {
    if (preselectedJobId && jobs.length > 0 && !selectedJob) {
      const found = jobs.find((j) => j.id === preselectedJobId);
      if (found) setSelectedJob(found);
    }
  }, [preselectedJobId, jobs, selectedJob]);

  function parseLocations(job: Job): string[] {
    if (job.locations) {
      try { return JSON.parse(job.locations) as string[]; } catch { /* fall through */ }
    }
    return [job.location];
  }

  function parseSkills(s: string): string[] {
    try { return JSON.parse(s); } catch { return []; }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === jobs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(jobs.map((j) => j.id)));
    }
  }

  async function handleApplyClick() {
    if (!isLoggedIn) {
      const dest = selectedJob ? `/jobs?job=${selectedJob.id}` : "/jobs";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
      return;
    }
    setProfileCheckLoading(true);
    try {
      const [profileRes, resumesRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/resumes"),
      ]);
      const profile = await profileRes.json();
      const resumeList: Resume[] = resumesRes.ok ? await resumesRes.json() : [];

      const parsedSkills: string[] = (() => {
        try { return JSON.parse(profile.skills ?? "[]"); } catch { return []; }
      })();

      const status: ProfileStatus = {
        hasSkills: parsedSkills.length > 0,
        hasExperience: (profile.workExperiences ?? []).length > 0,
        hasEducation: (profile.educations ?? []).length > 0,
      };

      setProfileStatus(status);
      setResumes(resumeList);

      // Pre-select default resume if available
      const defaultResume = resumeList.find((r) => r.isDefault) ?? resumeList[0];
      if (defaultResume) setSelectedResumeId(defaultResume.id);

      const allGood = status.hasSkills && status.hasExperience && status.hasEducation;
      setApplying(allGood);
      if (!allGood) {
        // Stay on the panel — guided onboarding is shown via profileStatus
      }
    } finally {
      setProfileCheckLoading(false);
    }
  }

  async function applyToJobs(jobIds: string[]) {
    if (!isLoggedIn) {
      const jobParam = selectedJob ? `?job=${selectedJob.id}` : "";
      router.push(`/login?callbackUrl=/jobs${jobParam}`);
      return;
    }
    setSubmitting(true);
    setResults([]);
    const res: ApplyResult[] = [];
    for (const jobId of jobIds) {
      try {
        const r = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            coverLetter: coverLetter || null,
            resumeId: selectedResumeId || null,
          }),
        });
        const data = await r.json();
        if (r.status === 201) res.push({ jobId, status: "ok", applicationId: data.id });
        else if (r.status === 409) res.push({ jobId, status: "duplicate", message: "Already applied" });
        else res.push({ jobId, status: "error", message: data.error });
      } catch {
        res.push({ jobId, status: "error", message: "Network error" });
      }
    }
    setResults(res);
    setSubmitting(false);
    setApplying(false);
    setProfileStatus(null);
    setBulkMode(false);
    setSelected(new Set());

    const okCount = res.filter((r) => r.status === "ok").length;
    const errCount = res.filter((r) => r.status === "error").length;
    if (okCount > 0) {
      setAppliedAppIds((prev) => {
        const next = new Map(prev);
        res.filter((r) => r.status === "ok" && r.applicationId).forEach((r) => next.set(r.jobId, r.applicationId!));
        return next;
      });
      setToast({
        message: okCount === 1
          ? "Application submitted successfully!"
          : `${okCount} applications submitted!`,
        ok: true,
      });
    } else if (errCount > 0) {
      setToast({ message: res.find((r) => r.status === "error")?.message ?? "Application failed.", ok: false });
    }
    setTimeout(() => setToast(null), 5000);
  }

  const jobsToApply = bulkMode ? [...selected] : (selectedJob ? [selectedJob.id] : []);

  function openReport() {
    if (!isLoggedIn) { router.push("/login?callbackUrl=/jobs"); return; }
    setReporting(true);
    setReportCategory("FAKE_JOB");
    setReportDesc("");
  }

  async function submitReport() {
    if (!selectedJob) return;
    setReportLoading(true);
    const res = await fetch(`/api/jobs/${selectedJob.id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: reportCategory, description: reportDesc.trim() || undefined }),
    });
    const data = await res.json();
    setReportLoading(false);
    setReporting(false);
    setToast({
      message: res.ok ? "Report submitted. Thank you for keeping the platform safe." : (data.error ?? "Failed to submit report."),
      ok: res.ok,
    });
    setTimeout(() => setToast(null), 5000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Search + filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder={t("jobs.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="relative sm:w-52">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="input pl-9 appearance-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {NA_LOCATIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <select
            className="input sm:w-44"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk apply controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {loading ? t("common.loading") : `${jobs.length} ${t("jobs.jobsFound")}`}
        </p>
        <div className="flex items-center gap-2">
          {bulkMode ? (
            <>
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {selected.size === jobs.length ? <CheckSquare size={16} /> : <Square size={16} />}
                {selected.size === jobs.length ? t("jobs.deselectAll") : t("jobs.selectAll")}
              </button>
              <Button
                disabled={selected.size === 0 || submitting || profileCheckLoading}
                onClick={async () => {
                  // Ensure profile is complete before bulk submitting
                  setProfileCheckLoading(true);
                  try {
                    const [profileRes, resumesRes] = await Promise.all([
                      fetch("/api/profile"),
                      fetch("/api/resumes"),
                    ]);
                    const profile = await profileRes.json();
                    const resumeList: Resume[] = resumesRes.ok ? await resumesRes.json() : [];
                    const parsedSkills: string[] = (() => {
                      try { return JSON.parse(profile?.skills ?? "[]"); } catch { return []; }
                    })();
                    const hasExp = (profile?.workExperiences ?? []).length > 0 || (profile?.yearsExperience ?? 0) > 0;
                    const hasEdu = (profile?.educations ?? []).length > 0;
                    if (!parsedSkills.length || !hasExp || !hasEdu) {
                      setToast({ message: "Complete your profile (skills, work experience & education) before applying.", ok: false });
                      setTimeout(() => setToast(null), 6000);
                      return;
                    }
                    if (!selectedResumeId) {
                      const def = resumeList.find((r) => r.isDefault) ?? resumeList[0];
                      if (def) setSelectedResumeId(def.id);
                    }
                  } finally {
                    setProfileCheckLoading(false);
                  }
                  applyToJobs(jobsToApply);
                }}
                size="sm"
              >
                {submitting || profileCheckLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {t("jobs.applyToSelected")} ({selected.size})
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setBulkMode(false); setSelected(new Set()); setProfileStatus(null); }}>
                {t("common.cancel")}
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => {
              if (!isLoggedIn) { router.push("/login?callbackUrl=/jobs"); return; }
              setBulkMode(true);
            }}>
              {t("jobs.quickApplyMultiple")}
            </Button>
          )}
        </div>
      </div>

      {/* Apply results banner */}
      {results.length > 0 && (
        <div className="card p-4 mb-4 space-y-2">
          <p className="font-medium text-gray-900 text-sm">{t("jobs.applicationResults")}</p>
          {results.map((r) => {
            const job = jobs.find((j) => j.id === r.jobId);
            return (
              <div key={r.jobId} className="flex items-center gap-2 text-sm">
                {r.status === "ok"        && <CheckCircle2 size={15} className="text-green-500 shrink-0" />}
                {r.status === "duplicate" && <CheckCircle2 size={15} className="text-gray-400 shrink-0" />}
                {r.status === "error"     && <XCircle      size={15} className="text-red-400 shrink-0" />}
                <span className={r.status === "ok" ? "text-green-700" : r.status === "duplicate" ? "text-gray-500" : "text-red-600"}>
                  {job?.title ?? r.jobId} — {r.status === "ok" ? t("jobs.applied") : r.status === "duplicate" ? t("jobs.alreadyApplied") : r.message}
                </span>
              </div>
            );
          })}
          <button onClick={() => setResults([])} className="text-xs text-gray-400 underline hover:text-gray-600">
            {t("jobs.dismiss")}
          </button>
        </div>
      )}

      {/* Split layout */}
      <div className="flex gap-6">

        {/* Job list — hidden on mobile when a job is selected */}
        <div className={`shrink-0 space-y-3 ${selectedJob && !bulkMode ? "hidden md:block md:w-96" : "w-full md:w-96"}`}>
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          )}
          {!loading && jobs.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">{t("jobs.noJobsFilter")}</div>
          )}
          {jobs.map((job) => {
            const skills = parseSkills(job.skills);
            const isSelected = selectedJob?.id === job.id;
            const isBulkSelected = selected.has(job.id);
            return (
              <div key={job.id} className="relative">
                {bulkMode && (
                  <button
                    onClick={() => toggleSelect(job.id)}
                    className="absolute top-3 left-3 z-10 text-brand-600"
                  >
                    {isBulkSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                )}
                <button
                  onClick={() => { setSelectedJob(job); if (!bulkMode) { setApplying(false); setProfileStatus(null); } }}
                  className={`card w-full text-left p-5 space-y-3 transition-all ${bulkMode ? "pl-10" : ""} ${
                    isSelected && !bulkMode ? "ring-2 ring-brand-500 shadow-card-hover" : ""
                  } ${isBulkSelected ? "ring-2 ring-brand-400 bg-brand-50/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-gray-900">{job.title}</p>
                        {job.employerProfile?.verificationStatus === "APPROVED" && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] font-semibold text-green-700" title="Verified employer">
                            <ShieldCheck size={9} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.employerProfile?.industry ?? "Company"} · {job.employerProfile?.companySize ?? "—"} {t("employer.employees")}
                      </p>
                    </div>
                    <Badge variant="outline">{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {(() => { const locs = parseLocations(job); return locs.length > 1 ? `${locs[0]} +${locs.length - 1} more` : locs[0]; })()}
                    </span>
                    <span className="flex items-center gap-1"><DollarSign size={11} />{formatSalary(job.salaryMin, job.salaryMax, locationToCurrency(job.location))}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(new Date(job.createdAt))}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 3).map((s) => (
                      <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
                    ))}
                    {skills.length > 3 && (
                      <span className="badge bg-gray-100 text-gray-600">+{skills.length - 3}</span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Job detail panel */}
        {!selectedJob && !bulkMode && (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center text-gray-400 space-y-2">
              <Briefcase size={32} className="mx-auto opacity-30" />
              <p className="text-sm">{t("jobs.selectJobToView")}</p>
            </div>
          </div>
        )}
        {selectedJob && !bulkMode && (
          <div className="flex-1">
            <div className="card p-6 md:p-8 md:sticky md:top-24 space-y-6 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
              {/* Back button — mobile only */}
              <button
                className="flex md:hidden items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 -mt-1 mb-1"
                onClick={() => setSelectedJob(null)}
              >
                <ArrowRight size={14} className="rotate-180" /> {t("jobs.backToJobs")}
              </button>
              {(() => {
                const skills = parseSkills(selectedJob.skills);
                return (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1 flex-wrap">
                            <MapPin size={13} />
                            {parseLocations(selectedJob).join(" · ")}
                          </span>
                          <span className="flex items-center gap-1"><Briefcase size={13} />{JOB_TYPE_LABELS[selectedJob.jobType] ?? selectedJob.jobType}</span>
                          <span className="flex items-center gap-1"><DollarSign size={13} />{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, locationToCurrency(selectedJob.location))}</span>
                        </div>
                        {selectedJob.employerProfile && (
                          <p className="mt-1 text-sm text-gray-400 flex items-center gap-1.5 flex-wrap">
                            {selectedJob.employerProfile.companyName}
                            {selectedJob.employerProfile.verificationStatus === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-semibold text-green-700" title="Verified employer">
                                <ShieldCheck size={11} /> Verified
                              </span>
                            )}
                            {selectedJob.employerProfile.industry && (
                              <span>· {selectedJob.employerProfile.industry}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 shrink-0">{selectedJob._count.applications} {t("jobs.applicants")}</span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t("jobs.requiredSkills")}</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <span key={s} className="badge bg-brand-50 text-brand-700 text-sm px-3 py-1">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t("jobs.aboutRole")}</p>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                    </div>

                    {/* Pipeline status badge */}
                    {(() => {
                      const pipe = PIPELINE_LABELS[selectedJob.pipelineStatus] ?? PIPELINE_LABELS["OPEN"];
                      return (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${pipe.cls}`}>
                            {pipe.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {selectedJob._count.applications} applicant{selectedJob._count.applications !== 1 ? "s" : ""}
                            {selectedJob.shortlistedCount > 0 && ` · ${selectedJob.shortlistedCount} shortlisted`}
                            {selectedJob.interviewCount > 0 && ` · ${selectedJob.interviewCount} in interview`}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Success confirmation — shown after a successful application */}
                    {selectedJob && appliedAppIds.has(selectedJob.id) ? (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle2 size={16} className="shrink-0" />
                          <p className="text-sm font-semibold">Application Submitted Successfully</p>
                        </div>
                        <p className="text-sm text-green-700">Your masked profile has been shared. Your identity remains hidden until an interview is scheduled.</p>
                        <div className="space-y-1 text-xs text-green-700">
                          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Skills &amp; experience shared</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Education shared</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Identity masked</div>
                        </div>
                        <div className="flex gap-2 pt-1 flex-wrap">
                          <Link
                            href={`/applications/${appliedAppIds.get(selectedJob.id)}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                          >
                            View My Application <ArrowRight size={12} />
                          </Link>
                          <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                          >
                            Track Status
                          </Link>
                          <button
                            onClick={() => setSelectedJob(null)}
                            className="text-xs text-green-600 hover:underline px-1"
                          >
                            Back to Jobs
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800">
                          <strong>{t("jobs.identityProtected")}</strong> {t("jobs.identityProtectedDesc")}
                        </div>

                        {/* Guided profile onboarding — shown when profile is incomplete */}
                        {profileStatus && !applying && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-amber-800">
                              <AlertCircle size={16} className="shrink-0" />
                              <p className="text-sm font-semibold">Complete your profile to apply</p>
                            </div>
                            <div className="space-y-2 text-sm">
                              {[
                                { ok: profileStatus.hasSkills,     label: "Skills",         href: "/profile#skills" },
                                { ok: profileStatus.hasExperience, label: "Work Experience", href: "/profile#experience" },
                                { ok: profileStatus.hasEducation,  label: "Education",       href: "/profile#education" },
                              ].map(({ ok, label, href }) => (
                                <div key={label} className="flex items-center justify-between gap-2">
                                  <span className={`flex items-center gap-1.5 ${ok ? "text-green-700" : "text-red-600"}`}>
                                    {ok
                                      ? <CheckCircle2 size={14} className="shrink-0" />
                                      : <XCircle size={14} className="shrink-0" />}
                                    {label}
                                  </span>
                                  {!ok && (
                                    <Link
                                      href={href}
                                      className="text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                                    >
                                      Add {label} →
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => setProfileStatus(null)}
                              className="text-xs text-amber-600 hover:underline"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {!appliedAppIds.has(selectedJob.id) && applying ? (
                      <div className="space-y-4">
                        {/* Resume selection — optional */}
                        {resumes.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                              <FileText size={14} /> Resume <span className="text-gray-400 font-normal text-xs">(optional)</span>
                            </label>
                            <select
                              className="input w-full"
                              value={selectedResumeId ?? ""}
                              onChange={(e) => setSelectedResumeId(e.target.value || null)}
                            >
                              {resumes.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}{r.isDefault ? " (default)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-gray-700">
                            {t("jobs.coverLetterLabel")} <span className="text-gray-400 font-normal text-xs">{t("jobs.coverLetterOptional")}</span>
                          </label>
                          <textarea
                            className="input resize-none"
                            rows={5}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder={t("jobs.coverLetterPlaceholder")}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            className="flex-1"
                            disabled={submitting}
                            onClick={() => applyToJobs(jobsToApply)}
                          >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                            {t("jobs.submitApplication")} <ArrowRight size={16} />
                          </Button>
                          <Button variant="secondary" onClick={() => { setApplying(false); setProfileStatus(null); }}>{t("common.cancel")}</Button>
                        </div>
                      </div>
                    ) : !isLoggedIn ? (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-start gap-3">
                          <Lock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">{t("jobs.signInToApplyTitle")}</strong> {t("jobs.signInToApplyDesc")}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button size="lg" className="flex-1" onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(`/jobs?job=${selectedJob.id}`)}`)}>
                            {t("auth.signIn")}
                          </Button>
                          <Button variant="secondary" size="lg" onClick={() => router.push(`/register?role=job-seeker&callbackUrl=${encodeURIComponent(`/jobs?job=${selectedJob.id}`)}`)}>
                            {t("auth.signUp")}
                          </Button>
                        </div>
                      </div>
                    ) : !appliedAppIds.has(selectedJob.id) && !profileStatus ? (
                      <Button size="lg" className="w-full" disabled={profileCheckLoading} onClick={handleApplyClick}>
                        {profileCheckLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {profileCheckLoading ? "Checking profile…" : t("jobs.apply")}
                        {!profileCheckLoading && <ArrowRight size={16} />}
                      </Button>
                    ) : null}

                    {/* Report recruiter */}
                    {isLoggedIn && !applying && (
                      reporting ? (
                        <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                              <Flag size={14} /> Report this job / recruiter
                            </p>
                            <button onClick={() => setReporting(false)} className="text-red-400 hover:text-red-600">
                              <X size={16} />
                            </button>
                          </div>
                          <select
                            className="input w-full text-sm"
                            value={reportCategory}
                            onChange={(e) => setReportCategory(e.target.value)}
                          >
                            <option value="FAKE_JOB">Fake job posting</option>
                            <option value="SCAM">Scam or fraudulent behavior</option>
                            <option value="MISLEADING_ROLE">Misleading role description</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <textarea
                            className="input w-full resize-none text-sm"
                            rows={3}
                            placeholder="Optional: add more details about the issue…"
                            value={reportDesc}
                            onChange={(e) => setReportDesc(e.target.value)}
                            maxLength={1000}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white flex-1"
                              disabled={reportLoading}
                              onClick={submitReport}
                            >
                              {reportLoading ? <Loader2 size={13} className="animate-spin" /> : <Flag size={13} />}
                              Submit Report
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setReporting(false)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={openReport}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mx-auto"
                        >
                          <Flag size={12} /> Report this job or recruiter
                        </button>
                      )
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {bulkMode && (
          <div className="hidden md:flex flex-1 items-start">
            <div className="card p-8 sticky top-24 space-y-5 w-full">
              <h2 className="text-lg font-semibold text-gray-900">{t("jobs.quickApply")}</h2>
              <p className="text-sm text-gray-500">{t("jobs.quickApplyDesc")}</p>
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800">
                <strong>{selected.size}</strong> job{selected.size !== 1 ? "s" : ""} selected
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("jobs.coverLetterLabel")} <span className="text-gray-400 font-normal">{t("jobs.coverLetterOptional")}</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={t("jobs.coverLetterBulkPlaceholder")}
                />
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={selected.size === 0 || submitting}
                onClick={() => applyToJobs(jobsToApply)}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {t("jobs.applyToSelected")} ({selected.size}) <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-medium transition-all ${
            toast.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.ok
            ? <CheckCircle2 size={16} className="shrink-0" />
            : <XCircle size={16} className="shrink-0" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsPageInner />
    </Suspense>
  );
}
