"use client";
import { useState } from "react";

type Step = { num: string; title: string; desc: string };

const RECRUITER_STEPS: Step[] = [
  {
    num: "1",
    title: "Post a Job",
    desc: "Create a job listing and choose whether to add an assessment or keep it simple.",
  },
  {
    num: "2",
    title: "Review Anonymous Profiles",
    desc: "Go through candidate profiles based only on skills and experience, without any personal details influencing your decision.",
  },
  {
    num: "3",
    title: "Schedule Interviews & Reveal",
    desc: "Invite top candidates for an interview, and only then will their personal details be revealed.",
  },
];

const SEEKER_STEPS: Step[] = [
  {
    num: "1",
    title: "Build Your Profile",
    desc: "Import from LinkedIn or fill in your skills, experience, and qualifications. Your personal details stay hidden.",
  },
  {
    num: "2",
    title: "Apply with Confidence",
    desc: "Browse and apply to roles. Employers only see your skills and experience — not your name, photo, or background.",
  },
  {
    num: "3",
    title: "Get Selected on Merit",
    desc: "When an employer is interested, they schedule an interview and your identity is revealed — fairly and transparently.",
  },
];

const STEP_ICONS = [
  // Step 1 — post a job
  <svg key="0" viewBox="0 0 64 64" className="h-10 w-10" fill="none">
    <rect x="12" y="20" width="40" height="28" rx="4" fill="#FBBF24" opacity="0.3"/>
    <rect x="16" y="16" width="32" height="28" rx="4" fill="#FBBF24" opacity="0.6"/>
    <rect x="20" y="12" width="24" height="28" rx="4" fill="#F59E0B"/>
    <path d="M28 22l8 4-8 4V22z" fill="white"/>
  </svg>,
  // Step 2 — review profiles
  <svg key="1" viewBox="0 0 64 64" className="h-10 w-10" fill="none">
    <rect x="14" y="14" width="36" height="36" rx="4" fill="#93C5FD" opacity="0.4"/>
    <circle cx="32" cy="28" r="8" fill="#3B82F6" opacity="0.7"/>
    <path d="M22 44c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="44" cy="18" r="6" fill="#EF4444" opacity="0.8"/>
    <path d="M41 18h6M44 15v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  // Step 3 — reveal at interview
  <svg key="2" viewBox="0 0 64 64" className="h-10 w-10" fill="none">
    <circle cx="28" cy="24" r="10" fill="#A78BFA" opacity="0.5"/>
    <circle cx="28" cy="24" r="6" fill="#7C3AED" opacity="0.7"/>
    <circle cx="44" cy="36" r="10" fill="#34D399" opacity="0.5"/>
    <circle cx="44" cy="36" r="6" fill="#059669" opacity="0.7"/>
    <path d="M32 28l8 4" stroke="#374151" strokeWidth="2" strokeDasharray="2 2"/>
  </svg>,
];

export function HowItWorksTabs() {
  const [active, setActive] = useState<"recruiter" | "seeker">("recruiter");
  const steps = active === "recruiter" ? RECRUITER_STEPS : SEEKER_STEPS;

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-gray-200 bg-white overflow-hidden">
          {(["recruiter", "seeker"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-8 py-2.5 text-sm font-medium transition-colors ${
                active === tab ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "recruiter" ? "Recruiter" : "Job Seeker"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.num} className="relative flex flex-col items-center text-center">
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-10 left-1/2 w-full border-t-2 border-dashed border-gray-300 -z-0" />
            )}
            <div className="relative z-10 mb-5">
              <span className="absolute -top-2 -left-2 text-xs font-semibold text-gray-400">{step.num}</span>
              <div className="h-20 w-20 rounded-full bg-white shadow-card flex items-center justify-center border border-gray-100">
                {STEP_ICONS[i]}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
