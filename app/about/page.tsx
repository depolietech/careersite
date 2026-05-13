"use client";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Shield, Eye, Users, Zap } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SectionHeader } from "@/components/home/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { useSession } from "next-auth/react";

export default function AboutPage() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | null)?.role ?? null;

  const STATS = [
    { value: "10,000+", label: t("about.stat1") },
    { value: "1,200+",  label: t("about.stat2") },
    { value: "3×",      label: t("about.stat3") },
    { value: "94%",     label: t("about.stat4") },
  ];

  const VALUES = [
    { icon: Shield, title: t("about.value1Title"), desc: t("about.value1Desc") },
    { icon: Eye,    title: t("about.value2Title"), desc: t("about.value2Desc") },
    { icon: Users,  title: t("about.value3Title"), desc: t("about.value3Desc") },
    { icon: Zap,    title: t("about.value4Title"), desc: t("about.value4Desc") },
  ];

  const TEAM = [
    { name: "Adebisi Depolie", role: t("about.roleFounder"), initials: "AD" },
    { name: "Head of Product",  role: t("about.roleProduct"),     initials: "HP" },
    { name: "Lead Engineer",    role: t("about.roleEngineering"),  initials: "LE" },
    { name: "Head of Growth",   role: t("about.roleGrowth"),       initials: "HG" },
  ];

  const BULLETS = [t("about.bullet1"), t("about.bullet2"), t("about.bullet3"), t("about.bullet4"), t("about.bullet5")];

  return (
    <div className="flex min-h-screen flex-col">

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest">
        <Navbar variant={userRole ? "app" : "marketing"} userRole={userRole} unreadCount={0} />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28 text-center">
          <span className="inline-block rounded-full bg-brand-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400 mb-6">
            {t("about.missionBadge")}
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight max-w-3xl mx-auto">
            {t("about.heroHeading")}
          </h1>
          <p className="mt-6 text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {t("about.heroDesc")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              {t("home.getStartedFree")} <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {t("about.contactUs")}
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1">

        {/* ─── Stats ───────────────────────────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-4xl font-bold text-brand-600">{s.value}</p>
                  <p className="mt-2 text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Story ───────────────────────────────────────────────────────── */}
        <section className="bg-[#EEF2EF] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div>
                <SectionHeader label={t("about.storyLabel")} heading={t("about.storyHeading")} />
                <div className="mt-8 space-y-4 text-gray-600 leading-relaxed text-sm">
                  <p>{t("about.storyP1")}</p>
                  <p>{t("about.storyP2")}</p>
                  <p>{t("about.storyP3")}</p>
                </div>
                <div className="mt-8 space-y-3">
                  {BULLETS.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-forest p-10 text-white space-y-6">
                <p className="text-lg font-semibold leading-snug">
                  &ldquo;{t("about.quote")}&rdquo;
                </p>
                <p className="text-sm text-gray-400">{t("about.quoteSource")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Values ──────────────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={t("about.valuesLabel")} heading={t("about.valuesHeading")} />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <div key={v.title} className="card p-6 space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                    <v.icon size={20} className="text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Team ────────────────────────────────────────────────────────── */}
        <section className="bg-[#EEF2EF] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={t("about.teamLabel")} heading={t("about.teamHeading")} />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((m) => (
                <div key={m.name} className="card p-6 flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-forest flex items-center justify-center text-white font-bold text-lg">
                    {m.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-400">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────────────────── */}
        <section className="bg-forest py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("home.ctaHeading")}</h2>
            <p className="mt-4 text-base text-gray-300">{t("home.ctaDesc")}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=job-seeker"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                {t("home.getStartedFree")} <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/register?role=employer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {t("home.postFirstJob")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
