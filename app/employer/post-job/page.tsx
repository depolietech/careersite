"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ShieldAlert, Clock, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { COUNTRIES, STATES, buildLocation, CURRENCY_LABEL } from "@/lib/locations";
import { getJobSuggestions } from "@/lib/job-taxonomy";

const JOB_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract",  label: "Contract" },
  { value: "remote",    label: "Remote" },
];

const EDUCATION_OPTIONS = [
  { value: "",            label: "No requirement" },
  { value: "high-school", label: "High School / GED" },
  { value: "college",     label: "College / Diploma" },
  { value: "bachelor",    label: "Bachelor's Degree" },
  { value: "master",      label: "Master's Degree" },
  { value: "phd",         label: "PhD / Doctorate" },
];

export default function PostJobPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [educationRequired, setEducationRequired] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  useEffect(() => {
    fetch("/api/employer/profile")
      .then((r) => r.json())
      .then((data) => { setVerificationStatus(data.verificationStatus ?? "INCOMPLETE"); })
      .catch(() => setVerificationStatus("INCOMPLETE"))
      .finally(() => setCheckingVerification(false));
  }, []);

  const stateOptions = country ? (STATES[country] ?? []) : [];
  const currency = CURRENCY_LABEL[country] ?? "USD";
  const currLabel = currency !== "USD" ? currency : "$";

  const suggestions = getJobSuggestions(jobTitle);

  const applySuggestions = useCallback(() => {
    if (!suggestions) return;
    setSkills((prev) => {
      const combined = [...prev];
      for (const s of suggestions.skills) { if (!combined.includes(s)) combined.push(s); }
      return combined;
    });
    setCerts((prev) => {
      const combined = [...prev];
      for (const c of suggestions.certifications) { if (!combined.includes(c)) combined.push(c); }
      return combined;
    });
    if (suggestions.education) setEducationRequired(suggestions.education);
  }, [suggestions]);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  }

  function addCert() {
    const c = certInput.trim();
    if (c && !certs.includes(c)) setCerts((p) => [...p, c]);
    setCertInput("");
  }

  function addLocation() {
    const loc = buildLocation(country, stateProvince);
    if (!loc) { setError("Please select a country first."); return; }
    setError(null);
    if (!locations.includes(loc)) setLocations((p) => [...p, loc]);
    setCountry(""); setStateProvince("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (locations.length === 0) {
      setError("Please add at least one location.");
      return;
    }

    // Salary validation
    const minVal = salaryMin ? Number(salaryMin) : null;
    const maxVal = salaryMax ? Number(salaryMax) : null;
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setError("Minimum salary cannot be greater than maximum salary.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const location = locations[0];

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          location,
          locations: locations.length > 1 ? locations : null,
          jobType: fd.get("jobType"),
          salaryMin: minVal,
          salaryMax: maxVal,
          experience: fd.get("experience") || null,
          educationRequired: educationRequired || null,
          certificateRequired: certs.length > 0 ? certs.join(", ") : null,
          skills,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post job");
      router.push("/employer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (checkingVerification) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (verificationStatus !== "APPROVED") {
    const isPending = verificationStatus === "PENDING_REVIEW";
    const Icon = isPending ? Clock : ShieldAlert;
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Post a job</h1>
        </div>
        <div className={`rounded-2xl border p-8 flex flex-col items-center text-center space-y-4 ${isPending ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}`}>
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isPending ? "bg-blue-100" : "bg-amber-100"}`}>
            <Icon size={28} className={isPending ? "text-blue-600" : "text-amber-600"} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {isPending ? "Verification Under Review" : "Account Verification Required"}
          </h2>
          <p className="text-sm text-gray-600 max-w-sm">
            {isPending
              ? "Your verification request is being reviewed by our team. You'll be able to post jobs once approved, typically within 1–2 business days."
              : "You must complete company verification before posting jobs. Fill in your company details and submit for admin review."}
          </p>
          <Link href="/employer/company/edit">
            <Button type="button" variant={isPending ? "secondary" : "primary"}>
              {isPending ? (
                <><Clock size={14} /> View verification status</>
              ) : (
                <><ShieldCheck size={14} /> Complete verification</>
              )}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Post a job</h1>
        <p className="mt-1 text-gray-500">Candidates will be reviewed with personal details masked.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Job details</h2>
          <Input
            name="title"
            label="Job title"
            required
            placeholder="e.g. Senior React Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          {suggestions && (
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
                  <Sparkles size={14} /> Suggested for &ldquo;{jobTitle}&rdquo;
                </p>
                <Button type="button" size="sm" variant="secondary" onClick={applySuggestions}>
                  Add all suggestions
                </Button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-brand-600 font-medium mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.skills.map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-label={`Add skill ${s}`}
                        onClick={() => { if (!skills.includes(s)) setSkills((p) => [...p, s]); }}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          skills.includes(s)
                            ? "bg-brand-200 text-brand-700 cursor-default"
                            : "bg-white border border-brand-200 text-brand-700 hover:bg-brand-100"
                        }`}
                      >
                        {skills.includes(s) ? "✓ " : "+ "}{s}
                      </button>
                    ))}
                  </div>
                </div>
                {suggestions.certifications.length > 0 && (
                  <div>
                    <p className="text-xs text-brand-600 font-medium mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.certifications.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Add certification ${c}`}
                          onClick={() => { if (!certs.includes(c)) setCerts((p) => [...p, c]); }}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            certs.includes(c)
                              ? "bg-brand-200 text-brand-700 cursor-default"
                              : "bg-white border border-brand-200 text-brand-700 hover:bg-brand-100"
                          }`}
                        >
                          {certs.includes(c) ? "✓ " : "+ "}{c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Select
                label="Country"
                options={COUNTRIES}
                value={country}
                onChange={(e) => { setCountry(e.target.value); setStateProvince(""); }}
              />
              {stateOptions.length > 0 && (
                <Select
                  label="State / Province"
                  options={stateOptions}
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                />
              )}
              <Button type="button" variant="secondary" size="sm" onClick={addLocation}>
                <Plus size={14} /> Add location
              </Button>
            </div>
            <Select name="jobType" label="Job type" options={JOB_TYPE_OPTIONS} required />
          </div>
          {locations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Job location{locations.length > 1 ? "s" : ""} <span className="text-xs text-gray-400 font-normal">(first is primary)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <span key={loc} className="flex items-center gap-1.5 badge bg-brand-50 text-brand-700 text-sm px-3 py-1">
                    {loc}
                    <button type="button" aria-label={`Remove ${loc}`} onClick={() => setLocations((p) => p.filter((l) => l !== loc))}>
                      <Trash2 size={11} className="text-brand-400 hover:text-brand-700" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <TextArea name="description" label="Job description" required placeholder="Describe the role, responsibilities, and what success looks like. Focus on skills rather than background." />
        </div>

        {/* Requirements */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input name="experience" label="Years of experience required" type="number" placeholder="3" />
            <Select
              name="educationRequired"
              label="Minimum education"
              options={EDUCATION_OPTIONS}
              value={educationRequired}
              onChange={(e) => setEducationRequired(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required certifications <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {certs.map((c) => (
                <span key={c} className="flex items-center gap-1.5 badge bg-brand-50 text-brand-700 text-sm px-3 py-1">
                  {c}
                  <button type="button" aria-label={`Remove ${c}`} onClick={() => setCerts((p) => p.filter((x) => x !== c))}>
                    <Trash2 size={11} className="text-brand-400 hover:text-brand-700" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="e.g. PMP, AWS Solutions Architect"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
              />
              <Button type="button" variant="secondary" onClick={addCert}>
                <Plus size={16} /> Add
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1.5 badge bg-brand-50 text-brand-700 text-sm px-3 py-1">
                  {s}
                  <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills((p) => p.filter((k) => k !== s))}>
                    <Trash2 size={11} className="text-brand-400 hover:text-brand-700" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Add a required skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                <Plus size={16} /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Salary range <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Minimum (${currLabel}/yr)`}
              type="number"
              placeholder="70000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <Input
              label={`Maximum (${currLabel}/yr)`}
              type="number"
              placeholder="100000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>
          {salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax) && (
            <p className="text-sm text-red-600">Minimum salary cannot exceed maximum salary.</p>
          )}
          <p className="text-xs text-gray-400">Displaying salary ranges improves application quality and reduces time-to-hire.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href="/employer/dashboard">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" loading={loading}>
            Publish job
          </Button>
        </div>
      </form>
    </div>
  );
}
