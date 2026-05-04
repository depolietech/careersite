"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { COUNTRIES, STATES, buildLocation, CURRENCY_LABEL } from "@/lib/locations";

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
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const stateOptions = country ? (STATES[country] ?? []) : [];
  const currency = CURRENCY_LABEL[country] ?? "USD";
  const currLabel = currency !== "USD" ? currency : "$";

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Salary validation
    const minVal = salaryMin ? Number(salaryMin) : null;
    const maxVal = salaryMax ? Number(salaryMax) : null;
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setError("Minimum salary cannot be greater than maximum salary.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const location = buildLocation(country, stateProvince);
    if (!location) { setError("Please select a location."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          location,
          jobType: fd.get("jobType"),
          salaryMin: minVal,
          salaryMax: maxVal,
          experience: fd.get("experience") || null,
          educationRequired: fd.get("educationRequired") || null,
          certificateRequired: fd.get("certificateRequired") || null,
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
          <Input name="title" label="Job title" required placeholder="e.g. Senior React Developer" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Select
                label="Country"
                options={COUNTRIES}
                required
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
            </div>
            <Select name="jobType" label="Job type" options={JOB_TYPE_OPTIONS} required />
          </div>
          <TextArea name="description" label="Job description" required placeholder="Describe the role, responsibilities, and what success looks like. Focus on skills rather than background." />
        </div>

        {/* Requirements */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input name="experience" label="Years of experience required" type="number" placeholder="3" />
            <Select name="educationRequired" label="Minimum education" options={EDUCATION_OPTIONS} />
          </div>
          <Input
            name="certificateRequired"
            label="Required certifications"
            placeholder="e.g. PMP, AWS Solutions Architect (leave blank if none)"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1.5 badge bg-brand-50 text-brand-700 text-sm px-3 py-1">
                  {s}
                  <button type="button" onClick={() => setSkills((p) => p.filter((k) => k !== s))}>
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
