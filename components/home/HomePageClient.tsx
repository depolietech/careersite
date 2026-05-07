"use client";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, ArrowUpRight, Star, CheckCircle2, MapPin, Briefcase, ArrowRight, Clock } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Starburst } from "@/components/shared/Starburst";
import { SectionHeader } from "@/components/home/SectionHeader";
import { HowItWorksTabs } from "@/components/home/HowItWorksTabs";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { PlatformUpdates } from "@/components/home/PlatformUpdates";
import { useI18n } from "@/lib/i18n";

type RecentJob = {
  id: string;
  title: string;
  location: string;
  jobType: string;
  createdAt: string;
  employerProfile: { industry: string | null } | null;
  _count: { applications: number };
};

const INTEGRATIONS = [
  { icon: <span className="text-base font-bold tracking-tight">in</span>, label: "LinkedIn" },
  { icon: <span className="text-base font-bold">in</span>, label: "Indeed" },
  { icon: <Smartphone size={18} />, label: "Mobile" },
];

const JOB_TYPE_KEYS: Record<string, string> = {
  "full-time": "jobs.fullTime",
  "part-time":  "jobs.partTime",
  "contract":   "jobs.contract",
  "remote":     "jobs.remote",
};

function timeAgo(dateStr: string, t: (key: string) => string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return t("home.timeToday");
  if (days === 1) return t("home.timeYesterday");
  if (days < 7)  return `${days} ${t("home.timeDaysAgo")}`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? t("home.timeWeekAgo") : t("home.timeWeeksAgo")}`;
}

export function HomePageClient({ recentJobs }: { recentJobs: RecentJob[] }) {
  const { t } = useI18n();

  const BENEFITS = [
    { title: t("home.benefit1Title"), desc: t("home.benefit1Desc"), emoji: "🛡️" },
    { title: t("home.benefit2Title"), desc: t("home.benefit2Desc"), emoji: "⚡" },
    { title: t("home.benefit3Title"), desc: t("home.benefit3Desc"), emoji: "🌍" },
    { title: t("home.benefit4Title"), desc: t("home.benefit4Desc"), emoji: "✅" },
    { title: t("home.benefit5Title"), desc: t("home.benefit5Desc"), emoji: "🔍" },
    { title: t("home.benefit6Title"), desc: t("home.benefit6Desc"), emoji: "🔒" },
  ];

  const TESTIMONIALS = [
    { quote: t("home.testimonial1Quote"), name: t("home.testimonial1Name"), role: t("home.testimonial1Role") },
    { quote: t("home.testimonial2Quote"), name: t("home.testimonial2Name"), role: t("home.testimonial2Role") },
    { quote: t("home.testimonial3Quote"), name: t("home.testimonial3Name"), role: t("home.testimonial3Role") },
  ];

  const TRUST_ITEMS = [t("home.trust1"), t("home.trust2"), t("home.trust3")];

  return (
    <div className="flex min-h-screen flex-col">

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest">
        <Navbar variant="marketing" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl">
                {t("home.heroHeading")}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-gray-300">
                {t("home.heroDesc")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register?role=employer"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                  {t("home.findTalents")}
                </Link>
                <Link href="/register?role=job-seeker"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  {t("home.showcaseSkills")}
                </Link>
              </div>
              <div className="mt-10">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {t("home.supportedIntegrations")}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {INTEGRATIONS.map((item) => (
                    <div key={item.label} title={item.label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white/70 hover:border-white/40 transition-colors">
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center h-[420px]">
              <div className="absolute top-4 left-1/2 -translate-x-12 z-10">
                <Starburst size={40} />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-48 w-48 rounded-full border-2 border-dashed border-brand-500/40" />
              <div className="absolute bottom-8 right-4 h-24 w-24 opacity-30"
                style={{ backgroundImage: "radial-gradient(circle, #3FBA6F 1.5px, transparent 1.5px)", backgroundSize: "10px 10px" }} />
              <div className="absolute left-0 top-8 h-64 w-64 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl z-10">
                <Image src="/images/hero1.jpg" alt="Diverse professionals" fill className="object-cover" />
              </div>
              <div className="absolute right-4 bottom-4 h-72 w-60 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl z-20">
                <Image src="/images/hero3.jpg" alt="Inclusive hiring" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">

        {/* ─── Benefits ────────────────────────────────────────────────────── */}
        <section className="bg-[#EEF2EF] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label={t("home.benefitsLabel")}
              heading={
                <>
                  {t("home.benefitsHeading1")} <span className="text-brand-500">{t("home.benefitsHeading2")}</span> {t("home.benefitsHeading3")}{" "}
                  <br className="hidden sm:block" />
                  <span className="text-brand-500">{t("home.benefitsHeading4")}</span> {t("home.benefitsHeading5")}
                </>
              }
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.title} className="card p-6 space-y-3">
                  <span className="text-3xl">{b.emoji}</span>
                  <h3 className="font-semibold text-gray-900">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Latest Jobs ─────────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <SectionHeader label={t("home.openPositions")} heading={t("home.latestJobs")} />
              <Link href="/jobs" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                {t("home.viewAllJobs")} <ArrowRight size={14} />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
                <p>{t("home.noOpenPositions")}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentJobs.map((job) => (
                  <Link key={job.id} href="/jobs" className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow group">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{job.employerProfile?.industry ?? "Company"}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{t(JOB_TYPE_KEYS[job.jobType] ?? "jobs.fullTime")}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(job.createdAt, t)}</span>
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{job._count.applications} {job._count.applications !== 1 ? t("home.applicants") : t("home.applicant")}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-brand-600 transition-colors">
                        {t("home.viewJob")} <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                {t("home.viewAllJobs")} <ArrowRight size={14} />
              </Link>
            </div>
            <p className="mt-8 text-center text-xs text-gray-400">{t("home.anonymousNotice")}</p>
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-[#E4EDF0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionHeader label={t("home.howItWorksLabel")} heading={t("home.howItWorksHeading")} display />
            </div>
            <HowItWorksTabs />
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
        <section id="faq" className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionHeader label={t("home.faqLabel")} heading={<>{t("home.faqHeading1")}<br />{t("home.faqHeading2")}</>} display />
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ─── Testimonials ────────────────────────────────────────────────── */}
        <section className="bg-[#EEF2EF] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <SectionHeader label={t("home.testimonialsLabel")} heading={t("home.testimonialsHeading")} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((item) => (
                <div key={item.name} className="card p-6 space-y-4">
                  <div className="flex gap-0.5">
                    {[0,1,2,3,4].map((i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Platform Updates ────────────────────────────────────────────── */}
        <PlatformUpdates />

        {/* ─── CTA ─────────────────────────────────────────────────────────── */}
        <section className="bg-forest py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("home.ctaHeading")}</h2>
            <p className="mt-4 text-base text-gray-300">{t("home.ctaDesc")}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register?role=job-seeker"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                {t("home.getStartedFree")} <ArrowUpRight size={16} />
              </Link>
              <Link href="/register?role=employer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                {t("home.postFirstJob")}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
              {TRUST_ITEMS.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-brand-400" /> {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
