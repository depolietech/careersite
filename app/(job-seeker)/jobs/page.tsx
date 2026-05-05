"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Clock, DollarSign, ArrowRight,
  CheckSquare, Square, CheckCircle2, XCircle, Loader2, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSalary, timeAgo, locationToCurrency } from "@/lib/utils";

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "contract":  "Contract",
  "remote":    "Remote only",
};

const NA_LOCATIONS = [
  { value: "",         label: "All Locations" },
  { value: "Remote",   label: "Remote" },
  { value: "USA",      label: "United States" },
  { value: "Canada",   label: "Canada" },
  { value: "Mexico",   label: "Mexico" },
];

const JOB_TYPES = [
  { value: "",           label: "All Types" },
  { value: "full-time",  label: "Full-time" },
  { value: "part-time",  label: "Part-time" },
  { value: "contract",   label: "Contract" },
];

type Job = {
  id: string;
  title: string;
  location: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: number | null;
  skills: string;
  description: string;
  createdAt: string;
  employerProfile: { companyName: string; industry: string | null; companySize: string | null } | null;
  _count: { applications: number };
};

type ApplyResult = { jobId: string; status: "ok" | "duplicate" | "error"; message?: string };

export default function JobsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

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
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

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

  function handleApplyClick() {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/jobs");
      return;
    }
    setApplying(true);
  }

  async function applyToJobs(jobIds: string[]) {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/jobs");
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
          }),
        });
        const data = await r.json();
        if (r.status === 201) res.push({ jobId, status: "ok" });
        else if (r.status === 409) res.push({ jobId, status: "duplicate", message: "Already applied" });
        else res.push({ jobId, status: "error", message: data.error });
      } catch {
        res.push({ jobId, status: "error", message: "Network error" });
      }
    }
    setResults(res);
    setSubmitting(false);
    setApplying(false);
    setBulkMode(false);
    setSelected(new Set());

    const okCount = res.filter((r) => r.status === "ok").length;
    const errCount = res.filter((r) => r.status === "error").length;
    if (okCount > 0) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Search + filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Job title, skill, keyword…"
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
          {loading ? "Loading…" : `${jobs.length} jobs found`}
        </p>
        <div className="flex items-center gap-2">
          {bulkMode ? (
            <>
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {selected.size === jobs.length ? <CheckSquare size={16} /> : <Square size={16} />}
                {selected.size === jobs.length ? "Deselect all" : "Select all"}
              </button>
              <Button
                disabled={selected.size === 0 || submitting}
                onClick={() => applyToJobs(jobsToApply)}
                size="sm"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                Apply to selected ({selected.size})
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setBulkMode(false); setSelected(new Set()); }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => {
              if (!isLoggedIn) { router.push("/login?callbackUrl=/jobs"); return; }
              setBulkMode(true);
            }}>
              Quick Apply to Multiple Jobs
            </Button>
          )}
        </div>
      </div>

      {/* Apply results banner */}
      {results.length > 0 && (
        <div className="card p-4 mb-4 space-y-2">
          <p className="font-medium text-gray-900 text-sm">Application results</p>
          {results.map((r) => {
            const job = jobs.find((j) => j.id === r.jobId);
            return (
              <div key={r.jobId} className="flex items-center gap-2 text-sm">
                {r.status === "ok"        && <CheckCircle2 size={15} className="text-green-500 shrink-0" />}
                {r.status === "duplicate" && <CheckCircle2 size={15} className="text-gray-400 shrink-0" />}
                {r.status === "error"     && <XCircle      size={15} className="text-red-400 shrink-0" />}
                <span className={r.status === "ok" ? "text-green-700" : r.status === "duplicate" ? "text-gray-500" : "text-red-600"}>
                  {job?.title ?? r.jobId} — {r.status === "ok" ? "Applied!" : r.status === "duplicate" ? "Already applied" : r.message}
                </span>
              </div>
            );
          })}
          <button onClick={() => setResults([])} className="text-xs text-gray-400 underline hover:text-gray-600">
            Dismiss
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
            <div className="card p-8 text-center text-gray-400 text-sm">No jobs match your filters</div>
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
                  onClick={() => { setSelectedJob(job); if (!bulkMode) setApplying(false); }}
                  className={`card w-full text-left p-5 space-y-3 transition-all ${bulkMode ? "pl-10" : ""} ${
                    isSelected && !bulkMode ? "ring-2 ring-brand-500 shadow-card-hover" : ""
                  } ${isBulkSelected ? "ring-2 ring-brand-400 bg-brand-50/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.employerProfile?.industry ?? "Company"} · {job.employerProfile?.companySize ?? "—"} employees
                      </p>
                    </div>
                    <Badge variant="outline">{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
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
              <p className="text-sm">Select a job to view details</p>
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
                <ArrowRight size={14} className="rotate-180" /> Back to jobs
              </button>
              {(() => {
                const skills = parseSkills(selectedJob.skills);
                return (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={13} />{selectedJob.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={13} />{JOB_TYPE_LABELS[selectedJob.jobType] ?? selectedJob.jobType}</span>
                          <span className="flex items-center gap-1"><DollarSign size={13} />{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, locationToCurrency(selectedJob.location))}</span>
                        </div>
                        {selectedJob.employerProfile && (
                          <p className="mt-1 text-sm text-gray-400">
                            {selectedJob.employerProfile.companyName} · {selectedJob.employerProfile.industry}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 shrink-0">{selectedJob._count.applications} applicants</span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required skills</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <span key={s} className="badge bg-brand-50 text-brand-700 text-sm px-3 py-1">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">About the role</p>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                    </div>

                    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800">
                      <strong>Your identity is protected.</strong> The employer only sees your skills and experience — name, photo, school, and company names stay hidden until an interview is scheduled.
                    </div>

                    {applying ? (
                      <div className="space-y-4">
                        <textarea
                          className="input resize-none"
                          rows={5}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Add a cover letter (optional) — focus on skills and what you can bring to the role."
                        />
                        <div className="flex gap-3">
                          <Button
                            className="flex-1"
                            disabled={submitting}
                            onClick={() => applyToJobs(jobsToApply)}
                          >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                            Submit application <ArrowRight size={16} />
                          </Button>
                          <Button variant="secondary" onClick={() => setApplying(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : !isLoggedIn ? (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-start gap-3">
                          <Lock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">Sign in to apply.</strong> Create a free account or log in to submit your application.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button size="lg" className="flex-1" onClick={() => router.push("/login?callbackUrl=/jobs")}>
                            Sign in to apply
                          </Button>
                          <Button variant="secondary" size="lg" onClick={() => router.push("/register?role=job-seeker")}>
                            Create account
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="lg" className="w-full" onClick={handleApplyClick}>
                        Apply — skills first <ArrowRight size={16} />
                      </Button>
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
              <h2 className="text-lg font-semibold text-gray-900">Quick Apply</h2>
              <p className="text-sm text-gray-500">
                Select jobs from the list and apply to all of them at once using your saved profile.
                Your identity stays masked — employers only see your skills and experience.
              </p>
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800">
                <strong>{selected.size}</strong> job{selected.size !== 1 ? "s" : ""} selected
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cover letter <span className="text-gray-400 font-normal">(optional — applied to all)</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Describe your skills and what you bring — this will be sent with all selected applications."
                />
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={selected.size === 0 || submitting}
                onClick={() => applyToJobs(jobsToApply)}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Apply to {selected.size} job{selected.size !== 1 ? "s" : ""} <ArrowRight size={16} />
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
