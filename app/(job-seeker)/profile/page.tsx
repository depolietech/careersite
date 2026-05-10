"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, EyeOff, Linkedin, Github, Info, Loader2, Pencil, X, Building2, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { COUNTRIES, STATES, buildLocation, parseLocation, CURRENCY_LABEL } from "@/lib/locations";
import { useI18n } from "@/lib/i18n";


// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  firstName: string; lastName: string; phone: string;
  linkedinUrl: string; githubUrl: string;
  headline: string; summary: string;
  yearsExperience: string; jobType: string;
  salaryMin: string; salaryMax: string;
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
  salaryMin: "", salaryMax: "",
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

// ─── Skills taxonomy for auto-suggest ────────────────────────────────────────

const SKILL_TAXONOMY: string[] = [
  // Engineering
  "JavaScript","TypeScript","Python","Java","Go","Rust","C++","C#","Ruby","PHP","Swift","Kotlin",
  "React","Next.js","Vue.js","Angular","Node.js","Express","Django","FastAPI","Spring Boot","Laravel",
  "PostgreSQL","MySQL","MongoDB","Redis","Elasticsearch","GraphQL","REST API","gRPC",
  "AWS","Azure","Google Cloud","Docker","Kubernetes","Terraform","CI/CD","Git","Linux",
  // Design
  "Figma","Sketch","Adobe XD","InVision","Zeplin","Prototyping","Wireframing","UI Design","UX Design",
  "User Research","Usability Testing","Design Systems","Accessibility","Motion Design",
  // Product
  "Product Management","Roadmapping","Agile","Scrum","Kanban","JIRA","Confluence","OKRs",
  "A/B Testing","Data Analysis","User Stories","Stakeholder Management","Go-to-Market",
  // Data & AI
  "Machine Learning","Deep Learning","TensorFlow","PyTorch","scikit-learn","Pandas","NumPy","SQL",
  "Data Visualization","Tableau","Power BI","Spark","Hadoop","dbt","Airflow","LLMs","Prompt Engineering",
  // Marketing
  "SEO","SEM","Google Ads","Facebook Ads","Content Marketing","Email Marketing","HubSpot","Salesforce",
  "Google Analytics","Brand Strategy","Copywriting","Social Media","Growth Hacking",
  // Sales & Operations
  "Sales","Account Management","CRM","Business Development","Negotiation","Project Management",
  "Operations","Supply Chain","Process Improvement","Six Sigma","Lean","Financial Modeling","Excel",
  // Soft skills
  "Leadership","Communication","Problem Solving","Critical Thinking","Teamwork","Mentoring","Coaching",
];

// ─── Work Experience Form ─────────────────────────────────────────────────────

function WorkExpForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: typeof EMPTY_WORK_EXP;
  onSave: (data: typeof EMPTY_WORK_EXP) => Promise<string | null>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const ROLE_CATEGORY_OPTIONS = [
    { value: "",            label: t("profile.selectCategory") },
    { value: "Engineering", label: t("profile.engineering") },
    { value: "Design",      label: t("profile.design") },
    { value: "Product",     label: t("profile.product") },
    { value: "Marketing",   label: t("profile.marketing") },
    { value: "Sales",       label: t("profile.sales") },
    { value: "Operations",  label: t("profile.operations") },
    { value: "Other",       label: t("profile.other") },
  ];

  const [form, setForm] = useState(initial ?? EMPTY_WORK_EXP);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
    const err = await onSave(form);
    if (err) setFormError(err);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/30 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label={t("profile.jobTitle")} required placeholder={t("profile.jobTitlePlaceholder")} value={form.title} onChange={field("title")} />
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <EyeOff size={12} className="text-amber-500" /> {t("profile.company")} <span className="text-amber-600 text-xs font-normal">({t("profile.masked")})</span>
          </label>
          <Input placeholder="e.g. Acme Inc." value={form.company} onChange={field("company")} required />
        </div>
      </div>

      <Select label={t("profile.roleCategory")} options={ROLE_CATEGORY_OPTIONS} value={form.roleCategory} onChange={field("roleCategory")} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <EyeOff size={12} className="text-amber-500" /> {t("profile.startDate")} <span className="text-amber-600 text-xs font-normal">({t("profile.masked")})</span>
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
              <EyeOff size={12} className="text-amber-500" /> {t("profile.endDate")} <span className="text-amber-600 text-xs font-normal">({t("profile.masked")})</span>
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
        {t("profile.currentlyWorkHere")}
      </label>

      <TextArea label={t("profile.descriptionLabel")} placeholder={t("profile.descriptionPlaceholder")} value={form.description ?? ""} onChange={field("description")} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t("profile.skillsInRole")}</label>
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
            placeholder={t("profile.addSkillPlaceholder")}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addSkill}><Plus size={14} /> {t("profile.add")}</Button>
        </div>
      </div>

      {formError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">{formError}</div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={saving}>{t("profile.saveEntry")}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>{t("common.cancel")}</Button>
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
  onSave: (data: typeof EMPTY_EDU) => Promise<string | null>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const DEGREE_OPTIONS = [
    { value: "",                label: t("education.selectDegree") },
    { value: "High School/GED", label: t("education.highSchool") },
    { value: "College/Diploma", label: t("education.college") },
    { value: "Bachelor's",      label: t("education.bachelors") },
    { value: "Master's",        label: t("education.masters") },
    { value: "PhD",             label: t("education.phd") },
    { value: "Other",           label: t("profile.other") },
  ];

  const [form, setForm] = useState(initial ?? EMPTY_EDU);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function field(k: keyof typeof EMPTY_EDU) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const err = await onSave(form);
    if (err) setFormError(err);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/30 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select label={t("profile.degreeQualification")} options={DEGREE_OPTIONS} required value={form.degree} onChange={field("degree")} />
        <Input label={t("profile.fieldOfStudy")} placeholder={t("profile.fieldOfStudyPlaceholder")} value={form.field} onChange={field("field")} />
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <EyeOff size={12} className="text-amber-500" /> {t("profile.institution")} <span className="text-amber-600 text-xs font-normal">({t("profile.masked")})</span>
        </label>
        <Input required placeholder={t("profile.institutionPlaceholder")} value={form.institution} onChange={field("institution")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <EyeOff size={12} className="text-amber-500" /> {t("profile.startYear")} <span className="text-amber-600 text-xs font-normal">({t("profile.masked")})</span>
          </label>
          <Input required type="number" placeholder="2018" value={form.startYear} onChange={field("startYear")} />
        </div>
        {!form.currentlyStudying && (
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <EyeOff size={12} className="text-amber-500" /> {t("profile.endYear")} <span className="text-amber-600 text-xs font-normal">({t("profile.masked")})</span>
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
        {t("profile.currentlyStudying")}
      </label>

      {formError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">{formError}</div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={saving}>{t("profile.saveEntry")}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>{t("common.cancel")}</Button>
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
  onSave: (data: typeof EMPTY_CERT) => Promise<string | null>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState(initial ?? EMPTY_CERT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function field(k: keyof typeof EMPTY_CERT) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const err = await onSave(form);
    if (err) setFormError(err);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/30 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label={t("profile.certName")} required placeholder={t("profile.certNamePlaceholder")} value={form.name} onChange={field("name")} />
        <Input label={t("profile.certIssuer")} required placeholder={t("profile.certIssuerPlaceholder")} value={form.issuer} onChange={field("issuer")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">{t("profile.dateObtained")}</label>
          <input type="month" className="input" value={form.dateObtained} onChange={(e) => setForm((f) => ({ ...f, dateObtained: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">{t("profile.expiryDate")} <span className="text-gray-400 font-normal text-xs">({t("profile.ifApplicable")})</span></label>
          <input type="month" className="input" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
        </div>
      </div>
      {formError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">{formError}</div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={saving}>{t("profile.saveEntry")}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>{t("common.cancel")}</Button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);

  const JOB_TYPE_OPTIONS = [
    { value: "",           label: t("profile.selectPreference") },
    { value: "full-time",  label: t("jobs.fullTime") },
    { value: "part-time",  label: t("jobs.partTime") },
    { value: "contract",   label: t("jobs.contract") },
    { value: "remote",     label: t("profile.remoteOnly") },
  ];

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [skills, setSkills]   = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const skillSuggestions = skillInput.trim().length > 0
    ? SKILL_TAXONOMY.filter(
        (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
      ).slice(0, 6)
    : [];
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
  const [country, setCountry] = useState("");
  const [stateProvince, setStateProvince] = useState("");

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
          });
          const { country: c, state: s } = parseLocation(data.location);
          setCountry(c);
          setStateProvince(s);
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

  // Warn user if they navigate away with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function set(field: keyof ProfileData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setProfile((p) => ({ ...p, [field]: e.target.value }));
      setIsDirty(true);
    };
  }

  function addSkill(override?: string) {
    const s = (override ?? skillInput).trim();
    if (s && !skills.includes(s)) { setSkills((prev) => [...prev, s]); setIsDirty(true); }
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((k) => k !== s));
    setIsDirty(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, skills, location: buildLocation(country, stateProvince) }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      } else {
        setSaved(true);
        setIsDirty(false);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  // ─── Work experience handlers ──────────────────────────────────────────────

  async function saveNewWorkExp(form: typeof EMPTY_WORK_EXP): Promise<string | null> {
    const res = await fetch("/api/profile/work-experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setWorkExps((prev) => [...prev, { ...created, skills: form.skills }]);
      setAddingWorkExp(false);
      return null;
    }
    const d = await res.json();
    return d.error ?? "Failed to save work experience";
  }

  async function updateWorkExp(id: string, form: typeof EMPTY_WORK_EXP): Promise<string | null> {
    const res = await fetch(`/api/profile/work-experience/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setWorkExps((prev) => prev.map((w) => w.id === id ? { ...w, ...form } : w));
      setEditingWorkExpId(null);
      return null;
    }
    const d = await res.json();
    return d.error ?? "Failed to update work experience";
  }

  async function deleteWorkExp(id: string) {
    const res = await fetch(`/api/profile/work-experience/${id}`, { method: "DELETE" });
    if (res.ok) setWorkExps((prev) => prev.filter((w) => w.id !== id));
  }

  // ─── Education handlers ────────────────────────────────────────────────────

  async function saveNewEdu(form: typeof EMPTY_EDU): Promise<string | null> {
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
      return null;
    }
    const d = await res.json();
    return d.error ?? "Failed to save education";
  }

  async function updateEdu(id: string, form: typeof EMPTY_EDU): Promise<string | null> {
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
      return null;
    }
    const d = await res.json();
    return d.error ?? "Failed to update education";
  }

  async function deleteEdu(id: string) {
    const res = await fetch(`/api/profile/education/${id}`, { method: "DELETE" });
    if (res.ok) setEducations((prev) => prev.filter((e) => e.id !== id));
  }

  // ─── Certification handlers ────────────────────────────────────────────────

  async function saveNewCert(form: typeof EMPTY_CERT): Promise<string | null> {
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
      return null;
    }
    const d = await res.json();
    return d.error ?? "Failed to save certification";
  }

  async function updateCert(id: string, form: typeof EMPTY_CERT): Promise<string | null> {
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
      return null;
    }
    const d = await res.json();
    return d.error ?? "Failed to update certification";
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
        <h1 className="text-2xl font-bold text-gray-900">{t("profile.yourProfile")}</h1>
        <p className="mt-1 text-gray-500">{t("profile.pageDesc")}</p>
      </div>

      {/* Masked fields notice */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
        <EyeOff size={16} className="shrink-0 mt-0.5" />
        <p><strong>{t("profile.maskedFields")}</strong> {t("profile.maskedNote")}</p>
      </div>

      <form ref={formRef} onSubmit={handleSave} className="space-y-8">
        {/* Personal info — MASKED */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <EyeOff size={15} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">{t("profile.personalInfo")} <span className="text-amber-600 text-xs font-normal">({t("profile.hiddenUntilInterview")})</span></h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("profile.firstName")} required placeholder="Alex" value={profile.firstName} onChange={set("firstName")} />
            <Input label={t("profile.lastName")} required placeholder="Smith" value={profile.lastName} onChange={set("lastName")} />
          </div>
          <Input label={t("profile.phone")} type="tel" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={set("phone")} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t("profile.photo")} <span className="text-gray-400 font-normal">({t("profile.hidden")})</span></label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold">
                {profile.firstName ? profile.firstName[0].toUpperCase() : "?"}
              </div>
              <button type="button" className="btn-secondary text-sm">{t("profile.uploadPhoto")}</button>
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
          <h2 className="font-semibold text-gray-900">{t("profile.professionalSummary")} <span className="text-green-600 text-xs font-normal">({t("profile.visibleToReviewers")})</span></h2>
          <Input label={t("profile.headline")} placeholder={t("profile.headlinePlaceholder")} value={profile.headline} onChange={set("headline")} />
          <TextArea label={t("profile.summary")} placeholder={t("profile.summaryPlaceholder")} value={profile.summary} onChange={set("summary")} />
        </div>

        {/* Skills */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">{t("profile.skills")} <span className="text-green-600 text-xs font-normal">({t("profile.visible")})</span></h2>
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
          <div className="relative">
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder={t("profile.addSkillInputPlaceholder")}
                value={skillInput}
                onChange={(e) => { setSkillInput(e.target.value); setShowSuggestions(true); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(); setShowSuggestions(false); }
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
              />
              <Button type="button" variant="secondary" onClick={() => { addSkill(); setShowSuggestions(false); }}>
                <Plus size={16} /> {t("profile.add")}
              </Button>
            </div>
            {showSuggestions && skillSuggestions.length > 0 && (
              <div className="absolute left-0 right-16 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {skillSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addSkill(s); setShowSuggestions(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job preferences */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">{t("profile.jobPreferences")} <span className="text-green-600 text-xs font-normal">({t("profile.visible")})</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <Select label={t("profile.preferredJobType")} options={JOB_TYPE_OPTIONS} value={profile.jobType} onChange={set("jobType")} />
            <div className="space-y-3">
              <Select
                label={t("profile.preferredCountry")}
                options={COUNTRIES}
                value={country}
                onChange={(e) => { setCountry(e.target.value); setStateProvince(""); }}
              />
              {STATES[country]?.length > 0 && (
                <Select
                  label={t("profile.stateProvince")}
                  options={STATES[country]}
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                />
              )}
            </div>
          </div>
          {(() => {
            const curr = CURRENCY_LABEL[country] ?? "USD";
            const currLabel = curr !== "USD" ? curr : "$";
            return (
              <div className="grid grid-cols-2 gap-4">
                <Input label={`${t("profile.minSalary")} (${currLabel}/yr)`} type="number" placeholder="80000" value={profile.salaryMin} onChange={set("salaryMin")} />
                <Input label={`${t("profile.maxSalary")} (${currLabel}/yr)`} type="number" placeholder="120000" value={profile.salaryMax} onChange={set("salaryMax")} />
              </div>
            );
          })()}
          <Input label={t("profile.yearsOfExperience")} type="number" placeholder="5" value={profile.yearsExperience} onChange={set("yearsExperience")} />
        </div>

      </form>

      {/* ─── Work Experience ──────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">
              {t("profile.workHistory")} <span className="text-green-600 text-xs font-normal">({t("profile.workHistoryNote")})</span>
            </h2>
          </div>
          {!addingWorkExp && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingWorkExp(true); setEditingWorkExpId(null); }}>
              <Plus size={14} /> {t("profile.add")}
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
          <p className="text-sm text-gray-400 text-center py-4">{t("profile.noWorkHistory")}</p>
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
                    {w.startDate} – {w.current ? t("profile.present") : (w.endDate ?? "—")}
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
              {t("profile.education")} <span className="text-green-600 text-xs font-normal">({t("profile.educationNote")})</span>
            </h2>
          </div>
          {!addingEdu && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingEdu(true); setEditingEduId(null); }}>
              <Plus size={14} /> {t("profile.add")}
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
          <p className="text-sm text-gray-400 text-center py-4">{t("profile.noEducationHistory")}</p>
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
                    {e.startYear} – {e.endYear ?? t("profile.present")}
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
              {t("profile.certifications")} <span className="text-green-600 text-xs font-normal">({t("profile.visibleToReviewers")})</span>
            </h2>
          </div>
          {!addingCert && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingCert(true); setEditingCertId(null); }}>
              <Plus size={14} /> {t("profile.add")}
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
          <p className="text-sm text-gray-400 text-center py-4">{t("profile.noCerts")}</p>
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
                      {c.dateObtained ? `${t("profile.obtained")} ${c.dateObtained}` : ""}
                      {c.dateObtained && c.expiryDate ? " · " : ""}
                      {c.expiryDate ? `${t("profile.expires")} ${c.expiryDate}` : ""}
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
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <Info size={14} className="shrink-0 text-red-500" />
          {error}
        </div>
      )}
      {isDirty && !saving && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Info size={14} className="shrink-0" />
          You have unsaved changes. Save before leaving this page.
        </div>
      )}
      <div className="card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Info size={12} />
          {t("profile.maskedStoredNote")}
        </div>
        <Button
          type="button"
          size="lg"
          disabled={saving}
          onClick={() => formRef.current?.requestSubmit()}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saved ? t("profile.saved") : saving ? t("profile.saving") : t("profile.saveProfile")}
        </Button>
      </div>
    </div>
  );
}
