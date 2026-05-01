"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, EyeOff, Linkedin, Github, Info, Loader2, Pencil, X, Building2, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";

const IMPORT_SOURCES = [
  { id: "linkedin",     label: "LinkedIn",     logo: "🔵" },
  { id: "indeed",       label: "Indeed",       logo: "🟣" },
  { id: "github",       label: "GitHub",       logo: "⚫" },
  { id: "glassdoor",    label: "Glassdoor",    logo: "🟢" },
  { id: "ziprecruiter", label: "ZipRecruiter", logo: "🔴" },
];

const JOB_TYPE_OPTIONS = [
  { value: "",           label: "Select preference" },
  { value: "full-time",  label: "Full-time" },
  { value: "part-time",  label: "Part-time" },
  { value: "contract",   label: "Contract" },
  { value: "remote",     label: "Remote only" },
];

const LOCATION_OPTIONS = [
  { value: "",       label: "Select location" },
  { value: "Remote", label: "Remote" },
  { value: "Canada", label: "Canada" },
  { value: "USA",    label: "United States" },
  { value: "Mexico", label: "Mexico" },
];

const ROLE_CATEGORY_OPTIONS = [
  { value: "",            label: "Select category" },
  { value: "Engineering", label: "Engineering" },
  { value: "Design",      label: "Design" },
  { value: "Product",     label: "Product" },
  { value: "Marketing",   label: "Marketing" },
  { value: "Sales",       label: "Sales" },
  { value: "Operations",  label: "Operations" },
  { value: "Other",       label: "Other" },
];

const DEGREE_OPTIONS = [
  { value: "",                label: "Select degree" },
  { value: "High School/GED", label: "High School / GED" },
  { value: "College/Diploma", label: "College / Diploma" },
  { value: "Bachelor's",      label: "Bachelor's Degree" },
  { value: "Master's",        label: "Master's Degree" },
  { value: "PhD",             label: "PhD / Doctorate" },
  { value: "Other",           label: "Other" },
];

const CURRENCY_LABEL: Record<string, string> = {
  Canada: "CAD", Mexico: "MXN",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  firstName: string; lastName: string; phone: string;
  linkedinUrl: string; githubUrl: string;
  headline: string; summary: string;
  yearsExperience: string; jobType: string;
  salaryMin: string; salaryMax: string; location: string;
};

type WorkExpEntry = {
  id: string;
  title: string;
  company: string;
  roleCategory: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  skills: string[];
};

type EducationEntry = {
  id: string;
  degree: string;
  field: string | null;
  institution: string;
  startYear: number;
  endYear: number | null;
};

type CertEntry = {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string | null;
  expiryDate: string | null;
};

const EMPTY_PROFILE: ProfileData = {
  firstName: "", lastName: "", phone: "",
  linkedinUrl: "", githubUrl: "",
  headline: "", summary: "",
  yearsExperience: "", jobType: "",
  salaryMin: "", salaryMax: "", location: "",
};

const EMPTY_WORK_EXP = {
  title: "", company: "", roleCategory: "", startDate: "",
  endDate: "", current: false, description: "", skills: [] as string[],
};

const EMPTY_EDU = {
  degree: "", field: "", institution: "",
  startYear: "", endYear: "", currentlyStudying: false,
};

const EMPTY_CERT = {
  name: "", issuer: "", dateObtained: "", expiryDate: "",
};

// ─── Work Experience Form ─────────────────────────────────────────────────────

function WorkExpForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: typeof EMPTY_WORK_EXP;
  onSave: (data: typeof EMPTY_WORK_EXP) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_WORK_EXP);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  function field(k: keyof typeof EMPTY_WORK_EXP) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/30 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Job title" required placeholder="e.g. Senior Engineer" value={form.title} onChange={field("title")} />
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <EyeOff size={12} className="text-amber-500" /> Company <span className="text-amber-600 text-xs font-normal">(masked)</span>
          </label>
          <Input placeholder="e.g. Acme Inc." value={form.company} onChange={field("company")} required />
        </div>
      </div>

      <Select label="Role category" options={ROLE_CATEGORY_OPTIONS} value={form.roleCategory} onChange={field("roleCategory")} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <EyeOff size={12} className="text-amber-500" /> Start date <span className="text-amber-600 text-xs font-normal">(masked)</span>
          </label>
          <input
            type="month"
            required
            className="input"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        {!form.current && (
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <EyeOff size={12} className="text-amber-500" /> End date <span className="text-amber-600 text-xs font-normal">(masked)</span>
            </label>
            <input
              type="month"
              className="input"
              value={form.endDate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={form.current}
          onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked, endDate: "" }))}
          className="rounded"
        />
        I currently work here
      </label>

      <TextArea label="Description" placeholder="What did you accomplish in this role? Focus on impact and skills." value={form.description ?? ""} onChange={field("description")} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Skills used in this role</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.skills.map((s) => (
            <span key={s} className="flex items-center gap-1 badge bg-brand-50 text-brand-700 text-xs px-2 py-0.5">
              {s}
              <button type="button" onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((k) => k !== s) }))}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1 text-sm"
            placeholder="Add a skill (e.g. React)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addSkill}><Plus size={14} /> Add</Button>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={saving}>Save entry</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Education Form ────────────────────────────────────────────────────────────

function EduForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: typeof EMPTY_EDU;
  onSave: (data: typeof EMPTY_EDU) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_EDU);
  const [saving, setSaving] = useState(false);

  function field(k: keyof typeof EMPTY_EDU) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/30 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select label="Degree / Qualification" options={DEGREE_OPTIONS} required value={form.degree} onChange={field("degree")} />
        <Input label="Field of study" placeholder="e.g. Computer Science" value={form.field} onChange={field("field")} />
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <EyeOff size={12} className="text-amber-500" /> Institution <span className="text-amber-600 text-xs font-normal">(masked)</span>
        </label>
        <Input required placeholder="e.g. University of Toronto" value={form.institution} onChange={field("institution")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <EyeOff size={12} className="text-amber-500" /> Start year <span className="text-amber-600 text-xs font-normal">(masked)</span>
          </label>
          <Input required type="number" placeholder="2018" value={form.startYear} onChange={field("startYear")} />
        </div>
        {!form.currentlyStudying && (
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <EyeOff size={12} className="text-amber-500" /> End year <span className="text-amber-600 text-xs font-normal">(masked)</span>
            </label>
            <Input type="number" placeholder="2022" value={form.endYear} onChange={field("endYear")} />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={form.currentlyStudying}
          onChange={(e) => setForm((f) => ({ ...f, currentlyStudying: e.target.checked, endYear: "" }))}
          className="rounded"
        />
        Currently studying
      </label>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={saving}>Save entry</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Certification Form ────────────────────────────────────────────────────────

function CertForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: typeof EMPTY_CERT;
  onSave: (data: typeof EMPTY_CERT) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_CERT);
  const [saving, setSaving] = useState(false);

  function field(k: keyof typeof EMPTY_CERT) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/30 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Certification name" required placeholder="e.g. AWS Solutions Architect" value={form.name} onChange={field("name")} />
        <Input label="Issuing organization" required placeholder="e.g. Amazon Web Services" value={form.issuer} onChange={field("issuer")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Date obtained</label>
          <input type="month" className="input" value={form.dateObtained} onChange={(e) => setForm((f) => ({ ...f, dateObtained: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Expiry date <span className="text-gray-400 font-normal text-xs">(if applicable)</span></label>
          <input type="month" className="input" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={saving}>Save entry</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [skills, setSkills]   = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [workExps, setWorkExps] = useState<WorkExpEntry[]>([]);
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [certifications, setCertifications] = useState<CertEntry[]>([]);

  const [addingWorkExp, setAddingWorkExp] = useState(false);
  const [editingWorkExpId, setEditingWorkExpId] = useState<string | null>(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [addingCert, setAddingCert] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setProfile({
            firstName:      data.firstName     ?? "",
            lastName:       data.lastName      ?? "",
            phone:          data.phone         ?? "",
            linkedinUrl:    data.linkedinUrl   ?? "",
            githubUrl:      data.githubUrl     ?? "",
            headline:       data.headline      ?? "",
            summary:        data.summary       ?? "",
            yearsExperience: data.yearsExperience ? String(data.yearsExperience) : "",
            jobType:        data.jobType       ?? "",
            salaryMin:      data.salaryMin     ? String(data.salaryMin) : "",
            salaryMax:      data.salaryMax     ? String(data.salaryMax) : "",
            location:       data.location      ?? "",
          });
          try { setSkills(JSON.parse(data.skills ?? "[]")); } catch { setSkills([]); }

          setWorkExps(
            (data.workExperiences ?? []).map((w: WorkExpEntry & { skills: string }) => ({
              ...w,
              skills: (() => { try { return JSON.parse(w.skills as unknown as string); } catch { return []; } })(),
            }))
          );
          setEducations(data.educations ?? []);
          setCertifications(data.certifications ?? []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function set(field: keyof ProfileData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProfile((p) => ({ ...p, [field]: e.target.value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((k) => k !== s));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, skills }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  // ─── Work experience handlers ──────────────────────────────────────────────

  async function saveNewWorkExp(form: typeof EMPTY_WORK_EXP) {
    const res = await fetch("/api/profile/work-experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setWorkExps((prev) => [...prev, { ...created, skills: form.skills }]);
      setAddingWorkExp(false);
    }
  }

  async function updateWorkExp(id: string, form: typeof EMPTY_WORK_EXP) {
    const res = await fetch(`/api/profile/work-experience/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setWorkExps((prev) => prev.map((w) => w.id === id ? { ...w, ...form } : w));
      setEditingWorkExpId(null);
    }
  }

  async function deleteWorkExp(id: string) {
    const res = await fetch(`/api/profile/work-experience/${id}`, { method: "DELETE" });
    if (res.ok) setWorkExps((prev) => prev.filter((w) => w.id !== id));
  }

  // ─── Education handlers ────────────────────────────────────────────────────

  async function saveNewEdu(form: typeof EMPTY_EDU) {
    const res = await fetch("/api/profile/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        degree: form.degree,
        field: form.field,
        institution: form.institution,
        startYear: form.startYear,
        endYear: form.currentlyStudying ? null : form.endYear,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setEducations((prev) => [...prev, created]);
      setAddingEdu(false);
    }
  }

  async function updateEdu(id: string, form: typeof EMPTY_EDU) {
    const res = await fetch(`/api/profile/education/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        degree: form.degree,
        field: form.field,
        institution: form.institution,
        startYear: form.startYear,
        endYear: form.currentlyStudying ? null : form.endYear,
      }),
    });
    if (res.ok) {
      setEducations((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, degree: form.degree, field: form.field || null, institution: form.institution, startYear: Number(form.startYear), endYear: form.currentlyStudying ? null : (form.endYear ? Number(form.endYear) : null) }
            : e
        )
      );
      setEditingEduId(null);
    }
  }

  async function deleteEdu(id: string) {
    const res = await fetch(`/api/profile/education/${id}`, { method: "DELETE" });
    if (res.ok) setEducations((prev) => prev.filter((e) => e.id !== id));
  }

  // ─── Certification handlers ────────────────────────────────────────────────

  async function saveNewCert(form: typeof EMPTY_CERT) {
    const res = await fetch("/api/profile/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        issuer: form.issuer,
        dateObtained: form.dateObtained || null,
        expiryDate: form.expiryDate || null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setCertifications((prev) => [...prev, created]);
      setAddingCert(false);
    }
  }

  async function updateCert(id: string, form: typeof EMPTY_CERT) {
    const res = await fetch(`/api/profile/certifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        issuer: form.issuer,
        dateObtained: form.dateObtained || null,
        expiryDate: form.expiryDate || null,
      }),
    });
    if (res.ok) {
      setCertifications((prev) =>
        prev.map((c) => c.id === id ? { ...c, ...form, dateObtained: form.dateObtained || null, expiryDate: form.expiryDate || null } : c)
      );
      setEditingCertId(null);
    }
  }

  async function deleteCert(id: string) {
    const res = await fetch(`/api/profile/certifications/${id}`, { method: "DELETE" });
    if (res.ok) setCertifications((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-gray-500">Employers see your skills and experience — highlighted fields are hidden until an interview is scheduled.</p>
      </div>

      {/* Import shortcuts */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900">Import from another platform</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {IMPORT_SOURCES.map((src) => (
            <button
              key={src.id}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              <span>{src.logo}</span>
              {src.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">Import will auto-fill your profile. You can edit everything after importing.</p>
      </div>

      {/* Masked fields notice */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
        <EyeOff size={16} className="shrink-0 mt-0.5" />
        <p><strong>Masked fields</strong> are hidden from employers until an interview is scheduled. This includes your name, photo, school names, company names, and employment dates.</p>
      </div>

      <form ref={formRef} onSubmit={handleSave} className="space-y-8">
        {/* Personal info — MASKED */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <EyeOff size={15} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Personal information <span className="text-amber-600 text-xs font-normal">(hidden until interview)</span></h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" required placeholder="Alex" value={profile.firstName} onChange={set("firstName")} />
            <Input label="Last name" required placeholder="Smith" value={profile.lastName} onChange={set("lastName")} />
          </div>
          <Input label="Phone number" type="tel" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={set("phone")} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Profile photo <span className="text-gray-400 font-normal">(hidden)</span></label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold">
                {profile.firstName ? profile.firstName[0].toUpperCase() : "?"}
              </div>
              <button type="button" className="btn-secondary text-sm">Upload photo</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Linkedin size={13} className="text-blue-600" /> LinkedIn
              </label>
              <Input placeholder="linkedin.com/in/alexsmith" value={profile.linkedinUrl} onChange={set("linkedinUrl")} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Github size={13} /> GitHub
              </label>
              <Input placeholder="github.com/alexsmith" value={profile.githubUrl} onChange={set("githubUrl")} />
            </div>
          </div>
        </div>

        {/* Professional summary — VISIBLE */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Professional summary <span className="text-green-600 text-xs font-normal">(visible to reviewers)</span></h2>
          <Input label="Headline" placeholder="e.g. Senior Frontend Developer with 7 years experience" value={profile.headline} onChange={set("headline")} />
          <TextArea label="Summary" placeholder="A brief, skills-focused summary — avoid mentioning your name, school, or company names." value={profile.summary} onChange={set("summary")} />
        </div>

        {/* Skills */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Skills <span className="text-green-600 text-xs font-normal">(visible)</span></h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 badge bg-brand-50 text-brand-700 text-sm px-3 py-1">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="text-brand-400 hover:text-brand-700">
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add a skill (e.g. React, Python, Figma)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              <Plus size={16} /> Add
            </Button>
          </div>
        </div>

        {/* Job preferences */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Job preferences <span className="text-green-600 text-xs font-normal">(visible)</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Preferred job type" options={JOB_TYPE_OPTIONS} value={profile.jobType} onChange={set("jobType")} />
            <Select label="Preferred location" options={LOCATION_OPTIONS} value={profile.location} onChange={set("location")} />
          </div>
          {(() => {
            const curr = CURRENCY_LABEL[profile.location] ?? "USD";
            const label = curr !== "USD" ? curr : "$";
            return (
              <div className="grid grid-cols-2 gap-4">
                <Input label={`Min. salary (${label}/yr)`} type="number" placeholder="80000" value={profile.salaryMin} onChange={set("salaryMin")} />
                <Input label={`Max. salary (${label}/yr)`} type="number" placeholder="120000" value={profile.salaryMax} onChange={set("salaryMax")} />
              </div>
            );
          })()}
          <Input label="Years of experience" type="number" placeholder="5" value={profile.yearsExperience} onChange={set("yearsExperience")} />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
      </form>

      {/* ─── Work Experience ──────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">
              Work history <span className="text-green-600 text-xs font-normal">(role &amp; duration visible · company &amp; dates masked)</span>
            </h2>
          </div>
          {!addingWorkExp && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingWorkExp(true); setEditingWorkExpId(null); }}>
              <Plus size={14} /> Add
            </Button>
          )}
        </div>

        {addingWorkExp && (
          <WorkExpForm
            onSave={saveNewWorkExp}
            onCancel={() => setAddingWorkExp(false)}
          />
        )}

        {workExps.length === 0 && !addingWorkExp && (
          <p className="text-sm text-gray-400 text-center py-4">No work history added yet.</p>
        )}

        <div className="space-y-3">
          {workExps.map((w) =>
            editingWorkExpId === w.id ? (
              <WorkExpForm
                key={w.id}
                initial={{
                  title: w.title,
                  company: w.company,
                  roleCategory: w.roleCategory ?? "",
                  startDate: w.startDate,
                  endDate: w.endDate ?? "",
                  current: w.current,
                  description: w.description ?? "",
                  skills: w.skills,
                }}
                onSave={(form) => updateWorkExp(w.id, form)}
                onCancel={() => setEditingWorkExpId(null)}
              />
            ) : (
              <div key={w.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-gray-900">{w.title}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <EyeOff size={11} className="text-amber-400 shrink-0" />
                    {w.company}
                    {w.roleCategory && <span className="text-gray-400">· {w.roleCategory}</span>}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <EyeOff size={10} className="text-amber-400" />
                    {w.startDate} – {w.current ? "Present" : (w.endDate ?? "—")}
                  </p>
                  {w.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {w.skills.map((s) => <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingWorkExpId(w.id); setAddingWorkExp(false); }} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteWorkExp(w.id)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ─── Education ────────────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">
              Education <span className="text-green-600 text-xs font-normal">(degree &amp; field visible · institution &amp; dates masked)</span>
            </h2>
          </div>
          {!addingEdu && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingEdu(true); setEditingEduId(null); }}>
              <Plus size={14} /> Add
            </Button>
          )}
        </div>

        {addingEdu && (
          <EduForm
            onSave={saveNewEdu}
            onCancel={() => setAddingEdu(false)}
          />
        )}

        {educations.length === 0 && !addingEdu && (
          <p className="text-sm text-gray-400 text-center py-4">No education history added yet.</p>
        )}

        <div className="space-y-3">
          {educations.map((e) =>
            editingEduId === e.id ? (
              <EduForm
                key={e.id}
                initial={{
                  degree: e.degree,
                  field: e.field ?? "",
                  institution: e.institution,
                  startYear: String(e.startYear),
                  endYear: e.endYear ? String(e.endYear) : "",
                  currentlyStudying: !e.endYear,
                }}
                onSave={(form) => updateEdu(e.id, form)}
                onCancel={() => setEditingEduId(null)}
              />
            ) : (
              <div key={e.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{e.degree}{e.field ? ` — ${e.field}` : ""}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <EyeOff size={11} className="text-amber-400 shrink-0" />
                    {e.institution}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <EyeOff size={10} className="text-amber-400" />
                    {e.startYear} – {e.endYear ?? "Present"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingEduId(e.id); setAddingEdu(false); }} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteEdu(e.id)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ─── Certifications ───────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">
              Certifications <span className="text-green-600 text-xs font-normal">(visible to reviewers)</span>
            </h2>
          </div>
          {!addingCert && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingCert(true); setEditingCertId(null); }}>
              <Plus size={14} /> Add
            </Button>
          )}
        </div>

        {addingCert && (
          <CertForm
            onSave={saveNewCert}
            onCancel={() => setAddingCert(false)}
          />
        )}

        {certifications.length === 0 && !addingCert && (
          <p className="text-sm text-gray-400 text-center py-4">No certifications added yet.</p>
        )}

        <div className="space-y-3">
          {certifications.map((c) =>
            editingCertId === c.id ? (
              <CertForm
                key={c.id}
                initial={{
                  name: c.name,
                  issuer: c.issuer,
                  dateObtained: c.dateObtained ?? "",
                  expiryDate: c.expiryDate ?? "",
                }}
                onSave={(form) => updateCert(c.id, form)}
                onCancel={() => setEditingCertId(null)}
              />
            ) : (
              <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-0.5">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.issuer}</p>
                  {(c.dateObtained || c.expiryDate) && (
                    <p className="text-xs text-gray-400">
                      {c.dateObtained ? `Obtained ${c.dateObtained}` : ""}
                      {c.dateObtained && c.expiryDate ? " · " : ""}
                      {c.expiryDate ? `Expires ${c.expiryDate}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingCertId(c.id); setAddingCert(false); }} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteCert(c.id)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ─── Save — bottom of page ─────────────────────────────────────────────── */}
      <div className="card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Info size={12} />
          Masked fields are stored securely and never shown to reviewers until an interview is scheduled.
        </div>
        <Button
          type="button"
          size="lg"
          disabled={saving}
          onClick={() => formRef.current?.requestSubmit()}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saved ? "Saved!" : saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
