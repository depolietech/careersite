"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";

const COMPANY_SIZE_OPTIONS = [
  { value: "",        label: "Select size" },
  { value: "1-10",    label: "1–10 employees" },
  { value: "11-50",   label: "11–50 employees" },
  { value: "51-200",  label: "51–200 employees" },
  { value: "201-1000",label: "201–1,000 employees" },
  { value: "1000+",   label: "1,000+ employees" },
];

const LOCATION_OPTIONS = [
  { value: "",        label: "Select location" },
  { value: "Remote",  label: "Remote / Distributed" },
  { value: "Canada",  label: "Canada" },
  { value: "USA",     label: "United States" },
  { value: "Mexico",  label: "Mexico" },
];

type FormData = {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  description: string;
};

const EMPTY: FormData = {
  companyName: "", industry: "", companySize: "",
  website: "", location: "", description: "",
};

export default function EditCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/employer/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.companyName !== undefined) {
          setForm({
            companyName: data.companyName ?? "",
            industry:    data.industry    ?? "",
            companySize: data.companySize ?? "",
            website:     data.website     ?? "",
            location:    data.location    ?? "",
            description: data.description ?? "",
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
      setSaved(true);
      setTimeout(() => router.push("/employer/company"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/company" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to profile
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Company Profile</h1>
        <p className="mt-1 text-gray-500">This information is shown to candidates and on your job postings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Company details</h2>
          <Input label="Company name" required value={form.companyName} onChange={field("companyName")} placeholder="Acme Inc." />
          <Input label="Industry" value={form.industry} onChange={field("industry")} placeholder="e.g. Software, Healthcare, Finance" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Company size" options={COMPANY_SIZE_OPTIONS} value={form.companySize} onChange={field("companySize")} />
            <Select label="Location" options={LOCATION_OPTIONS} value={form.location} onChange={field("location")} />
          </div>
          <Input label="Website" type="url" value={form.website} onChange={field("website")} placeholder="https://company.com" />
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">About the company</h2>
          <TextArea
            label="Description"
            value={form.description}
            onChange={field("description")}
            placeholder="Tell candidates what makes your company a great place to work. Focus on culture, mission, and opportunities."
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href="/employer/company">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" loading={saving}>
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
