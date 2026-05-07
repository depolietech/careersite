import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export const metadata = { title: "Help — EqualHires" };

const SECTIONS = [
  {
    title: "Getting started",
    items: [
      { q: "How do I create an account?", a: "Click 'Create an account' on the homepage. Choose 'Job Seeker' or 'Recruiter', enter your email and a strong password, then verify your email address." },
      { q: "What is anonymous hiring?", a: "EqualHires hides identifying information (name, photo, school, company names) from recruiters until an interview is scheduled. You are evaluated on your skills and experience first." },
      { q: "Is EqualHires free for job seekers?", a: "Yes — completely free. No credit card required. Job seekers can create a profile, apply to unlimited jobs, and use all platform features at no cost." },
    ],
  },
  {
    title: "Accounts & login",
    items: [
      { q: "I forgot my password. What do I do?", a: "Go to the login page and click 'Forgot password'. Enter your email address and we'll send you a reset link valid for 1 hour." },
      { q: "I didn't receive a verification email.", a: "Check your spam/junk folder. If it's not there, go to the login page, enter your email, and click 'Resend verification email'." },
      { q: "How do I delete my account?", a: "Go to Settings → Danger Zone → Delete account. This permanently removes all your data and cannot be undone." },
    ],
  },
  {
    title: "For recruiters",
    items: [
      { q: "How does recruiter verification work?", a: "After registering, complete your company profile with your legal name, address, phone, website, and LinkedIn. Submit for review. Our team verifies your details within 1–2 business days." },
      { q: "Why can't I post jobs yet?", a: "Your account must be verified and approved before you can post jobs. Check your company profile page for your current verification status." },
      { q: "I was approved — when can I log in?", a: "You will receive an email notification when your account is approved. You can then log in normally and start posting jobs." },
    ],
  },
  {
    title: "Privacy & safety",
    items: [
      { q: "Who can see my personal information?", a: "Only after an interview is scheduled with a specific employer — and only that employer can see your full identity. All other recruiters see your masked profile." },
      { q: "How do I report a suspicious job posting?", a: "On the job listing page, use the 'Report' button. Our team reviews all reports within 48 hours and may suspend the recruiter if the report is confirmed." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="marketing" />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 mb-4">
              <HelpCircle size={24} className="text-brand-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
            <p className="mt-2 text-gray-500">Answers to the most common questions about EqualHires.</p>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title} className="card p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 text-lg">{section.title}</h2>
                <div className="space-y-4 divide-y divide-gray-100">
                  {section.items.map((item) => (
                    <div key={item.q} className="pt-4 first:pt-0">
                      <p className="font-medium text-gray-900 text-sm">{item.q}</p>
                      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-forest p-8 text-white text-center space-y-3">
            <p className="font-semibold text-lg">Still need help?</p>
            <p className="text-gray-300 text-sm">Our support team usually responds within one business day.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Contact support <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
