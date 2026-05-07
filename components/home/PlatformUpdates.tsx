import { Circle, Rocket } from "lucide-react";

const IN_PROGRESS = [
  "Mobile app — iOS & Android",
  "LinkedIn profile import",
  "Recruiter verification workflow enhancements",
  "Password reset & account recovery",
];

const PLANNED = [
  "AI-powered skills-to-job matching",
  "Indeed & job board integration",
  "Video interview scheduling",
  "Employer analytics dashboard",
  "Candidate skill assessments",
];

export function PlatformUpdates() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600 mb-4">
            <Rocket size={12} /> What&apos;s Coming
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Platform Roadmap
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
            We ship continuously. Here&apos;s what&apos;s in progress and what&apos;s on the horizon.
          </p>
        </div>

        {/* 2-column grid */}
        <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">

          {/* In Progress */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400">
                <Circle size={10} className="text-white fill-white" />
              </span>
              <h3 className="font-semibold text-gray-900">In Progress</h3>
            </div>
            <ul className="space-y-3">
              {IN_PROGRESS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-amber-100 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              These features are actively being built. Sign up to be notified when they launch.
            </div>
          </div>

          {/* Planned */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400">
                <Rocket size={13} className="text-white" />
              </span>
              <h3 className="font-semibold text-gray-900">On the Roadmap</h3>
            </div>
            <ul className="space-y-3">
              {PLANNED.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-sky-100 px-4 py-3 text-xs text-sky-800 leading-relaxed">
              Have a feature idea? We&apos;d love to hear from you at{" "}
              <a href="mailto:info@equalhires.com" className="font-medium underline">
                info@equalhires.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
