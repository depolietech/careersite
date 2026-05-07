"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, MessageSquare, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const TOPIC_VALUES = [
  "General enquiry",
  "Job seeker support",
  "Recruiter / employer support",
  "Partnership or press",
  "Bug report",
  "Other",
];

export default function ContactPage() {
  const { t } = useI18n();

  const CONTACT_DETAILS = [
    { icon: Mail,    label: t("contact.emailLabel"), value: "info@equalhires.com",         sub: t("contact.emailSub") },
    { icon: MapPin,  label: t("contact.hqLabel"),    value: t("contact.hqValue"),           sub: t("contact.hqSub") },
    { icon: Clock,   label: t("contact.hoursLabel"), value: t("contact.hoursValue"),        sub: t("contact.hoursSub") },
  ];

  const TOPIC_LABELS = [
    t("contact.topic1"), t("contact.topic2"), t("contact.topic3"),
    t("contact.topic4"), t("contact.topic5"), t("contact.topic6"),
  ];

  const [form, setForm] = useState({ name: "", email: "", topic: TOPIC_VALUES[0], message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col">

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest">
        <Navbar variant="marketing" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full bg-brand-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400 mb-6">
            {t("contact.badge")}
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl leading-tight">
            {t("contact.heroHeading")}
          </h1>
          <p className="mt-4 text-base text-gray-300 max-w-xl mx-auto">
            {t("contact.heroDesc")}
          </p>
        </div>
      </section>

      <main className="flex-1 bg-[#EEF2EF]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">

            {/* ─── Contact details ───────────────────────────────────────── */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">{t("contact.detailsHeading")}</h2>
              {CONTACT_DETAILS.map((c) => (
                <div key={c.label} className="card p-5 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                    <c.icon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{c.label}</p>
                    <p className="mt-0.5 font-medium text-gray-900 text-sm">{c.value}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{c.sub}</p>
                  </div>
                </div>
              ))}

              <div className="card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-brand-600" />
                  <p className="font-semibold text-gray-900 text-sm">{t("contact.quickLinks")}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <Link href="/#faq" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                    <ArrowUpRight size={14} /> {t("contact.faqLink")}
                  </Link>
                  <Link href="/register" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                    <ArrowUpRight size={14} /> {t("contact.createAccount")}
                  </Link>
                  <Link href="/about" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                    <ArrowUpRight size={14} /> {t("contact.aboutLink")}
                  </Link>
                </div>
              </div>
            </div>

            {/* ─── Contact form ──────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="card p-12 flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                    <CheckCircle2 size={32} className="text-brand-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t("contact.sentTitle")}</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    {t("contact.sentDesc")}{" "}
                    <span className="font-medium text-gray-700">{form.email}</span>{" "}
                    {t("contact.sentWithin")}
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", topic: TOPIC_VALUES[0], message: "" }); }}
                    className="mt-2 text-sm font-medium text-brand-600 hover:underline"
                  >
                    {t("contact.sendAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card p-8 space-y-5">
                  <h2 className="text-xl font-bold text-gray-900">{t("contact.formTitle")}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t("contact.nameLabel")}
                      required
                      value={form.name}
                      onChange={field("name")}
                      placeholder="Alex Smith"
                    />
                    <Input
                      label={t("auth.email")}
                      type="email"
                      required
                      value={form.email}
                      onChange={field("email")}
                      placeholder="alex@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">{t("contact.topicLabel")}</label>
                    <select value={form.topic} onChange={field("topic")} className="input">
                      {TOPIC_VALUES.map((val, i) => (
                        <option key={val} value={val}>{TOPIC_LABELS[i]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("contact.messageLabel")} <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={field("message")}
                      placeholder={t("contact.messagePlaceholder")}
                      className="input resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    {t("contact.sendButton")}
                  </Button>

                  <p className="text-center text-xs text-gray-400">
                    {t("contact.privacyText")}{" "}
                    <Link href="/privacy" className="underline">{t("contact.privacyLink")}</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
