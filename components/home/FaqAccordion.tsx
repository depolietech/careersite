"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How does the anonymous hiring process work?",
    a: "When a candidate applies, their personal details (name, photo, school names, company names, and employment dates) are automatically hidden. Employers and contractors only see skills, experience level, and qualifications — ensuring decisions are based purely on merit.",
  },
  {
    q: "When do candidate details get revealed?",
    a: "Personal details are revealed automatically the moment an interview is scheduled. This is the only trigger — no manual overrides. This ensures the hiring decision is already made before identity is known.",
  },
  {
    q: "Can contractors use the platform on behalf of employers?",
    a: "Yes. Contractors have their own role and can review masked candidate profiles, forward shortlists to employer clients, and schedule interviews directly. Employers receive the shortlist without being exposed to unmasked profiles.",
  },
  {
    q: "Is the platform free for job seekers?",
    a: "Yes, job seekers can create a full profile, import from LinkedIn or Indeed, and apply to unlimited jobs at no cost. Employers and contractors are billed based on the number of active job listings.",
  },
  {
    q: "How do I import my existing resume or profile?",
    a: "You can import from LinkedIn, Indeed, GitHub, Glassdoor, or Stack Overflow in one click from your profile settings. You can also build your profile manually — it takes around 2 minutes.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {FAQS.map((faq, i) => (
        <div key={faq.q} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <span>{faq.q}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
