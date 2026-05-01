import Link from "next/link";
import Image from "next/image";
import { Smartphone, ArrowUpRight, Star, CheckCircle2, MapPin, Briefcase, ArrowRight, Clock } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Starburst } from "@/components/shared/Starburst";
import { SectionHeader } from "@/components/home/SectionHeader";
import { HowItWorksTabs } from "@/components/home/HowItWorksTabs";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { db } from "@/lib/db";

const INTEGRATIONS = [
  { icon: <span className="text-base font-bold tracking-tight">in</span>, label: "LinkedIn" },
  { icon: <span className="text-base font-bold">in</span>, label: "Indeed" },
  { icon: <Smartphone size={18} />, label: "Mobile" },
];

const BENEFITS = [
  { title: "100% Bias-Free Reviews",  desc: "Names, photos, school names, and employment dates are hidden until an interview is scheduled.", emoji: "🛡️" },
  { title: "Faster Shortlisting",     desc: "Focus only on skills and experience. No time wasted on irrelevant candidate details.", emoji: "⚡" },
  { title: "More Diverse Teams",      desc: "Companies using anonymous hiring report 3× more diverse shortlists and fairer hiring outcomes.", emoji: "🌍" },
  { title: "Free for Job Seekers",    desc: "Create a full profile, import from LinkedIn, and apply to unlimited jobs — completely free.", emoji: "✅" },
  { title: "Import in Seconds",       desc: "Import your profile from LinkedIn, Indeed, GitHub and more in under 2 minutes.", emoji: "📥" },
  { title: "Identity Revealed Fairly", desc: "Your personal details are only shared after an interview is scheduled — never before.", emoji: "🔒" },
];

const TESTIMONIALS = [
  { quote: "For the first time I felt my application was judged purely on what I can do, not who I am. Got three interviews in my first week.", name: "Software Engineer", role: "Job Seeker" },
  { quote: "Our shortlists are noticeably more diverse. The masking removes split-second decisions we weren't even aware we were making.", name: "Head of Talent", role: "Employer — 200-person tech company" },
  { quote: "Managing candidates on behalf of clients is seamless. I can forward masked profiles and the reveal happens automatically at interview.", name: "Recruitment Consultant", role: "Contractor" },
];

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "contract":  "Contract",
  "remote":    "Remote",
};

const TRUST_ITEMS = ["No credit card required", "Free for job seekers", "Setup in 2 minutes"];

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
}

export default async function HomePage() {
  const recentJobs = await db.job.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      employerProfile: { select: { companyName: true, industry: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="flex min-h-screen flex-col">

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest">
        <Navbar variant="marketing" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl">
                Hire Based On Skills And Experience Without Bias.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-gray-300">
                Our platform helps employers build a stronger, more qualified team
                by removing unconscious bias from the hiring process.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register?role=employer"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                  Find Skilled Talents
                </Link>
                <Link href="/register?role=job-seeker"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  Showcase Your Skills
                </Link>
              </div>

              <div className="mt-10">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Supported Integrations:
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

            {/* Photo collage + decorations */}
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
              label="Benefits"
              heading={
                <>
                  Why <span className="text-brand-500">Recruiters</span> and{" "}
                  <br className="hidden sm:block" />
                  <span className="text-brand-500">Job seekers</span> choose us
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
              <SectionHeader
                label="Open Positions"
                heading="Latest Jobs"
              />
              <Link
                href="/jobs"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                View all jobs <ArrowRight size={14} />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
                <p>No open positions right now — check back soon.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.employerProfile?.industry ?? "Company"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(job.createdAt)}</span>
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}</span>
                      <Link
                        href="/register?role=job-seeker"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
                      >
                        Apply <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                View all jobs <ArrowRight size={14} />
              </Link>
            </div>

            {/* Privacy notice */}
            <p className="mt-8 text-center text-xs text-gray-400">
              Applications are reviewed anonymously — your identity stays hidden until an interview is scheduled.
            </p>
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-[#E4EDF0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionHeader label="How it work" heading="How It Works" display />
            </div>
            <HowItWorksTabs />
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
        <section id="faq" className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionHeader label="FAQ" heading={<>Frequently asked<br />Questions</>} display />
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ─── Testimonials ────────────────────────────────────────────────── */}
        <section className="bg-[#EEF2EF] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <SectionHeader label="Testimonials" heading="What people are saying" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="card p-6 space-y-4">
                  <div className="flex gap-0.5">
                    {[0,1,2,3,4].map((i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────────────────── */}
        <section className="bg-forest py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to hire — or be hired — fairly?
            </h2>
            <p className="mt-4 text-base text-gray-300">
              Join thousands of job seekers and companies building fairer workplaces.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register?role=job-seeker"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                Get started free <ArrowUpRight size={16} />
              </Link>
              <Link href="/register?role=employer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                Post your first job
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
              {TRUST_ITEMS.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-brand-400" /> {t}
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
