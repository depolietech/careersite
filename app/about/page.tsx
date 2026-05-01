import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Shield, Eye, Users, Zap } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SectionHeader } from "@/components/home/SectionHeader";

const STATS = [
  { value: "10,000+", label: "Job seekers registered" },
  { value: "1,200+", label: "Companies hiring" },
  { value: "3×", label: "More diverse shortlists" },
  { value: "94%", label: "Recruiter satisfaction" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Fairness by design",
    desc: "Bias prevention isn't a feature we added on — it's the entire foundation of how EqualHire works. Every decision in the product is made with equity in mind.",
  },
  {
    icon: Eye,
    title: "Radical transparency",
    desc: "We tell candidates exactly what is hidden and why. We tell recruiters exactly when and how identity is revealed. No surprises, no grey areas.",
  },
  {
    icon: Users,
    title: "People first",
    desc: "Behind every application is a person who deserves a fair shot. We build for them — not just for the companies paying to hire.",
  },
  {
    icon: Zap,
    title: "Speed without shortcuts",
    desc: "Bias-free hiring shouldn't mean slow hiring. We've designed every workflow to be faster than traditional ATS tools, not slower.",
  },
];

const TEAM = [
  { name: "Adebisi Depolie", role: "Founder & CEO", initials: "AD" },
  { name: "Head of Product", role: "Product", initials: "HP" },
  { name: "Lead Engineer", role: "Engineering", initials: "LE" },
  { name: "Head of Growth", role: "Growth", initials: "HG" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest">
        <Navbar variant="marketing" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28 text-center">
          <span className="inline-block rounded-full bg-brand-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400 mb-6">
            Our Mission
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight max-w-3xl mx-auto">
            Hiring should be about what you can do, not who you are.
          </h1>
          <p className="mt-6 text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            EqualHire was built on a simple belief: the best candidates are often overlooked because
            of unconscious bias — not a lack of skill. We built the platform to fix that.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Get started free <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Contact us
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
                <SectionHeader label="Our Story" heading="Why we built EqualHire" />
                <div className="mt-8 space-y-4 text-gray-600 leading-relaxed text-sm">
                  <p>
                    Research consistently shows that candidates with certain names, schools, or employment
                    gaps are screened out before a recruiter ever reads their skills. This isn't malice —
                    it's how the human brain processes information under time pressure.
                  </p>
                  <p>
                    EqualHire was founded to change the inputs, not lecture the humans. By structurally
                    removing names, photos, school names, and employment dates from the initial review,
                    we give every candidate the same starting line.
                  </p>
                  <p>
                    Identity is only revealed after a recruiter commits to an interview — at which point
                    the decision has already been made on merit. The result: fairer outcomes for candidates
                    and stronger, more diverse teams for employers.
                  </p>
                </div>
                <div className="mt-8 space-y-3">
                  {["Anonymous screening until interview stage", "Duration-only work history (no dates that reveal age)", "Skill-first candidate matching"].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-forest p-10 text-white space-y-6">
                <p className="text-lg font-semibold leading-snug">
                  &ldquo;Companies using structured, anonymous hiring report 3× more diverse shortlists
                  and measurably better retention after 12 months.&rdquo;
                </p>
                <p className="text-sm text-gray-400">— Harvard Business Review, 2023</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Values ──────────────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label="What we stand for" heading="Our values" />
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
            <SectionHeader label="The team" heading="The people behind EqualHire" />
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
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to hire — or be hired — fairly?
            </h2>
            <p className="mt-4 text-base text-gray-300">
              Join thousands of job seekers and companies building fairer workplaces.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=job-seeker"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Get started free <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/register?role=employer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Post your first job
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
