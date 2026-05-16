import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Rocket } from "lucide-react";

export const metadata = { title: "What's New — Equalhires" };

const SHIPPED = [
  "Skills-based matching engine — job seekers see top-matched jobs with % score, skill gaps, and cert recommendations on their dashboard; recruiters can rank the entire talent pool against any posted job",
  "Multi-location job postings — employers can add multiple locations per job listing; job seekers see all locations in the detail panel",
  "Auto-suggest skills & certs — typing a job title on the post-job form surfaces relevant skills, certifications, and education requirements to add in one click",
  "Application analytics now clickable — Response Rate card filters to responded applications; Top Skills badges link to job search for that skill",
  "Recruiter login fixed — company verification pending no longer blocks login; recruiters can update their profile and request verification while using the platform",
  "Reinstatement emails — users who request account reinstatement now receive confirmation, approval, and rejection emails",
  "Recruiter Reviews & Ratings — rate communication, fairness, and professionalism",
  "Email Preferences — opt-out of job alerts, app updates, and marketing (CAN-SPAM / CASL)",
];

const IN_PROGRESS = [
  "Mobile app — iOS & Android",
];

const PLANNED = [
  "Indeed & job board integration",
  "Additional Language Support — Arabic, Portuguese, German, Mandarin, Hindi",
];

export default function WhatsNewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What&apos;s New &amp; Coming</h1>
        <p className="text-sm text-gray-500">
          We ship continuously. Here&apos;s what just launched and what&apos;s on the horizon.
        </p>
      </div>

      {/* Recently Shipped */}
      <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
            <CheckCircle2 size={14} className="text-white" />
          </span>
          <h2 className="font-semibold text-gray-900">Recently Shipped</h2>
        </div>
        <ul className="space-y-3">
          {SHIPPED.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* In Progress */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400">
            <Circle size={10} className="text-white fill-white" />
          </span>
          <h2 className="font-semibold text-gray-900">In Progress</h2>
        </div>
        <ul className="space-y-3">
          {IN_PROGRESS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          These features are actively being built. Sign up to be notified when they launch.
        </div>
      </div>

      {/* On the Roadmap */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400">
            <Rocket size={13} className="text-white" />
          </span>
          <h2 className="font-semibold text-gray-900">On the Roadmap</h2>
        </div>
        <ul className="space-y-3">
          {PLANNED.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl bg-sky-100 px-4 py-3 text-xs text-sky-800 leading-relaxed">
          Have a feature idea? We&apos;d love to hear from you at{" "}
          <a href="mailto:admin@equalhires.com" className="font-medium underline">
            admin@equalhires.com
          </a>
        </div>
      </div>
    </div>
  );
}
