"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle, Globe, Linkedin, MapPin, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

type VerificationStatus = "INCOMPLETE" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

type FormData = {
  companyName: string;
  companyLegalName: string;
  industry: string;
  companySize: string;
  website: string;
  businessAddress: string;
  phone: string;
  businessRegistrationNumber: string;
  linkedinUrl: string;
  location: string;
  description: string;
};

type ProfileData = FormData & {
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  websiteCheckPassed: boolean | null;
  domainMatchPassed: boolean | null;
  verificationSubmittedAt: string | null;
  trustScore: number;
};

const EMPTY: FormData = {
  companyName: "", companyLegalName: "", industry: "", companySize: "",
  website: "", businessAddress: "", phone: "", businessRegistrationNumber: "",
  linkedinUrl: "", location: "", description: "",
};

const STATUS_CONFIG: Record<VerificationStatus, { icon: React.ElementType; color: string; bg: string; border: string; label: string; desc: string }> = {
  INCOMPLETE:     { icon: ShieldAlert,  color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200", label: "Verification Required",   desc: "Fill in all company details below and submit for review before you can post jobs." },
  PENDING_REVIEW: { icon: Clock,        color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",  label: "Under Review",            desc: "Your verification request has been submitted and is being reviewed by our team. We'll update you within 1–2 business days." },
  APPROVED:       { icon: ShieldCheck,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200", label: "Verified",                desc: "Your company is verified. You can post jobs and schedule interviews." },
  REJECTED:       { icon: XCircle,      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",   label: "Verification Rejected",   desc: "Your verification was rejected. Please update the information below and re-submit." },
};

export default function EditCompanyPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const COMPANY_SIZE_OPTIONS = [
    { value: "",         label: t("employer.selectSize") },
    { value: "1-10",     label: t("companySize.size1") },
    { value: "11-50",    label: t("companySize.size2") },
    { value: "51-200",   label: t("companySize.size3") },
    { value: "201-1000", label: t("companySize.size4") },
    { value: "1000+",    label: t("companySize.size5") },
  ];

  const LOCATION_OPTIONS = [
    { value: "",       label: t("employer.selectLocation") },
    { value: "Remote", label: t("employer.locationRemote") },
    { value: "Canada", label: t("employer.locationCanada") },
    { value: "USA",    label: t("employer.locationUSA") },
    { value: "Mexico", label: t("employer.locationMexico") },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/employer/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.companyName !== undefined) {
          setProfile(data);
          setForm({
            companyName:                data.companyName                ?? "",
            companyLegalName:           data.companyLegalName           ?? "",
            industry:                   data.industry                   ?? "",
            companySize:                data.companySize                ?? "",
            website:                    data.website                    ?? "",
            businessAddress:            data.businessAddress            ?? "",
            phone:                      data.phone                      ?? "",
            businessRegistrationNumber: data.businessRegistrationNumber ?? "",
            linkedinUrl:                data.linkedinUrl                ?? "",
            location:                   data.location                   ?? "",
            description:                data.description                ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function field(k: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/employer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      const updated = await res.json();
      setProfile((p) => p ? { ...p, ...updated } : updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitVerification() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/employer/verify", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setProfile((p) => p ? { ...p, verificationStatus: "PENDING_REVIEW", websiteCheckPassed: data.websiteCheckPassed, domainMatchPassed: data.domainMatchPassed } : p);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const vStatus: VerificationStatus = profile?.verificationStatus ?? "INCOMPLETE";
  const statusCfg = STATUS_CONFIG[vStatus];
  const StatusIcon = statusCfg.icon;
  const canSubmit = vStatus === "INCOMPLETE" || vStatus === "REJECTED";
  const allFieldsFilled = form.companyName.trim() && form.companyLegalName.trim() && form.website.trim() && form.businessAddress.trim() && form.phone.trim() && form.linkedinUrl.trim();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/company" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> {t("employer.backToProfile")}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("employer.editCompanyProfile")}</h1>
        <p className="mt-1 text-gray-500">{t("employer.editProfileDesc")}</p>
      </div>

      {/* Verification status banner */}
      <div className={`rounded-2xl border ${statusCfg.border} ${statusCfg.bg} p-5`}>
        <div className="flex items-start gap-3">
          <StatusIcon size={20} className={`${statusCfg.color} shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`font-semibold text-sm ${statusCfg.color}`}>{statusCfg.label}</p>
            <p className="text-sm text-gray-600 mt-0.5">{statusCfg.desc}</p>
            {vStatus === "REJECTED" && profile?.verificationNote && (
              <p className="mt-2 text-sm text-red-700 font-medium">Reason: {profile.verificationNote}</p>
            )}
            {(vStatus === "APPROVED" || vStatus === "PENDING_REVIEW") && profile && (
              <div className="mt-3 flex flex-wrap gap-3">
                {profile.websiteCheckPassed !== null && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${profile.websiteCheckPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    <Globe size={11} />
                    Website {profile.websiteCheckPassed ? "reachable" : "unreachable"}
                  </span>
                )}
                {profile.domainMatchPassed !== null && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${profile.domainMatchPassed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    <CheckCircle2 size={11} />
                    Domain {profile.domainMatchPassed ? "matches email" : "differs from email"}
                  </span>
                )}
                {profile.trustScore !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 bg-gray-100 text-gray-700">
                    <ShieldCheck size={11} />
                    Trust score: {profile.trustScore}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic company info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">{t("employer.companyDetails")}</h2>
          <Input label={t("employer.companyName")} required value={form.companyName} onChange={field("companyName")} placeholder="Acme Inc." />
          <Input label={t("employer.industry")} value={form.industry} onChange={field("industry")} placeholder="e.g. Software, Healthcare, Finance" />
          <div className="grid grid-cols-2 gap-4">
            <Select label={t("employer.companySizeLabel")} options={COMPANY_SIZE_OPTIONS} value={form.companySize} onChange={field("companySize")} />
            <Select label={t("jobs.location")} options={LOCATION_OPTIONS} value={form.location} onChange={field("location")} />
          </div>
          <Input label={t("employer.website")} type="url" value={form.website} onChange={field("website")} placeholder="https://company.com" />
        </div>

        {/* Identity verification fields */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">Company Identity</h2>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 border border-red-100">Required for verification</span>
          </div>
          <p className="text-sm text-gray-500">These details are reviewed by our team before you can post jobs.</p>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Company Legal Name <span className="text-red-400">*</span>
            </label>
            <input
              className="input"
              value={form.companyLegalName}
              onChange={field("companyLegalName")}
              placeholder="Acme Incorporated"
              required
            />
            <p className="text-xs text-gray-400">The full registered legal name of your business.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> Business Address <span className="text-red-400">*</span></span>
            </label>
            <input
              className="input"
              value={form.businessAddress}
              onChange={field("businessAddress")}
              placeholder="123 Main St, Toronto, ON, Canada"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1.5"><Phone size={13} /> Business Phone <span className="text-red-400">*</span></span>
            </label>
            <input
              className="input"
              type="tel"
              value={form.phone}
              onChange={field("phone")}
              placeholder="+1 (416) 555-0100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1.5"><FileText size={13} /> Business Registration Number</span>
            </label>
            <input
              className="input"
              value={form.businessRegistrationNumber}
              onChange={field("businessRegistrationNumber")}
              placeholder="e.g. 123456789 RC0001"
            />
            <p className="text-xs text-gray-400">Company registration, EIN, BN, or equivalent. Helps us verify your business.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1.5"><Linkedin size={13} /> LinkedIn Company Page <span className="text-red-400">*</span></span>
            </label>
            <input
              className="input"
              value={form.linkedinUrl}
              onChange={field("linkedinUrl")}
              placeholder="https://linkedin.com/company/acme-inc"
            />
          </div>
        </div>

        {/* About */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">{t("employer.aboutCompany")}</h2>
          <TextArea
            label={t("employer.description")}
            value={form.description}
            onChange={field("description")}
            placeholder="Tell candidates what makes your company a great place to work."
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href="/employer/company">
            <Button variant="secondary" type="button">{t("common.cancel")}</Button>
          </Link>
          <Button type="submit" size="lg" loading={saving}>
            {saved ? t("profile.saved") : t("profile.saveChanges")}
          </Button>
        </div>
      </form>

      {/* Verification submit section */}
      {canSubmit && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-600" />
            <h2 className="font-semibold text-gray-900">Submit for Verification</h2>
          </div>
          <p className="text-sm text-gray-500">
            Once all company identity fields are filled and saved, submit your profile for admin review. You can post jobs only after approval.
          </p>

          <ul className="space-y-1.5 text-sm">
            {[
              { label: "Company name",         ok: !!form.companyName.trim() },
              { label: "Company legal name",   ok: !!form.companyLegalName.trim() },
              { label: "Website",              ok: !!form.website.trim() },
              { label: "Business address",     ok: !!form.businessAddress.trim() },
              { label: "Business phone",       ok: !!form.phone.trim() },
              { label: "LinkedIn page",        ok: !!form.linkedinUrl.trim() },
            ].map((item) => (
              <li key={item.label} className={`flex items-center gap-2 ${item.ok ? "text-green-700" : "text-gray-400"}`}>
                {item.ok ? <CheckCircle2 size={14} /> : <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />}
                {item.label}
              </li>
            ))}
          </ul>

          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}
          {submitSuccess && (
            <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              Submitted! Our team will review your profile within 1–2 business days.
            </div>
          )}

          <Button
            type="button"
            onClick={handleSubmitVerification}
            loading={submitting}
            disabled={!allFieldsFilled || submitting || submitSuccess}
          >
            {submitSuccess ? "Submitted for review" : "Submit for verification"}
          </Button>
        </div>
      )}
    </div>
  );
}
