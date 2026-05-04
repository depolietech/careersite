import Link from "next/link";
import { ChevronRight, Shield, Eye, User, Briefcase, MessageSquare, Settings, HelpCircle } from "lucide-react";

const SECTIONS = [
  {
    icon: User,
    title: "Getting started",
    color: "bg-brand-50 text-brand-600",
    items: [
      { q: "How do I create an account?", a: "Click 'Create an account' on the homepage. Choose 'Job Seeker', fill in your email and a strong password, then verify your email address using the link we send you." },
      { q: "What information do I need to complete my profile?", a: "Your profile has two sections: public (headline, summary, skills, job title) which employers always see, and private (full name, photo, school names, company names, employment dates) which are hidden until an interview is scheduled." },
      { q: "Can I import my profile from LinkedIn or Indeed?", a: "Yes — go to your Profile page and click any of the import buttons. We'll auto-fill your details and you can edit everything after." },
    ],
  },
  {
    icon: Shield,
    title: "Privacy & bias protection",
    color: "bg-amber-50 text-amber-600",
    items: [
      { q: "What information is hidden from employers?", a: "Your full name, profile photo, school/university names, company names you've worked at, and exact employment dates are all hidden. Employers see only your job titles, skills, experience descriptions, and years of experience." },
      { q: "When does my identity get revealed?", a: "Only after an interview is scheduled — and only to the employer who schedules it. Other companies reviewing your applications still see your masked profile." },
      { q: "Can I choose to reveal my identity earlier?", a: "No. This protects both you and the employer by ensuring the shortlisting decision was made purely on skills. The reveal happens automatically once an interview is confirmed." },
    ],
  },
  {
    icon: Briefcase,
    title: "Applying for jobs",
    color: "bg-green-50 text-green-600",
    items: [
      { q: "How do I apply for a job?", a: "Browse jobs, click a listing to open the details panel, then click 'Apply — skills first'. You can add an optional cover letter focused on your relevant skills." },
      { q: "Can I apply to multiple jobs at once?", a: "Yes. On the Jobs page, click 'Quick Apply to Multiple Jobs', tick the jobs you want, write an optional shared cover letter, and submit. Your profile is sent to all selected employers instantly." },
      { q: "How many jobs can I apply to?", a: "There's no limit. We recommend applying broadly — our bias-free model means you'll be evaluated fairly everywhere." },
      { q: "Can I withdraw an application?", a: "Yes. Go to your Dashboard, find the application, and click 'Withdraw'. This removes your profile from that employer's review queue." },
    ],
  },
  {
    icon: Eye,
    title: "Application status",
    color: "bg-purple-50 text-purple-600",
    items: [
      { q: "What do the application statuses mean?", a: "Pending: received, not yet reviewed. Reviewing: recruiter is actively reading your profile. Shortlisted: you're in the top candidates. Interview Scheduled: the employer wants to meet you. Not Selected: they went with another candidate." },
      { q: "How long does it take to hear back?", a: "This depends entirely on the employer. Most active listings review applications within 1–2 weeks. You'll see real-time status updates on your dashboard." },
      { q: "Why does my dashboard say 'identity masked'?", a: "This is normal — it's the platform working as intended. Until an interview is booked, your name and personal details are hidden from all reviewers." },
    ],
  },
  {
    icon: MessageSquare,
    title: "Messages & interviews",
    color: "bg-blue-50 text-blue-600",
    items: [
      { q: "Can employers message me before an interview?", a: "Yes — once you're shortlisted, employers can send messages through our anonymous messaging system. Your personal contact details are still hidden at this stage." },
      { q: "How do I join an interview?", a: "When an interview is scheduled, a 'Join Interview' link appears on your dashboard. Click it at the scheduled time. Your identity is revealed to this specific employer at this point." },
      { q: "What if I need to reschedule an interview?", a: "Use the Messages page to contact the employer and agree on a new time. The employer will update the calendar invite." },
    ],
  },
  {
    icon: Settings,
    title: "Account & settings",
    color: "bg-gray-100 text-gray-600",
    items: [
      { q: "How do I change my password?", a: "Go to Settings → Security. Enter your current password and choose a new one." },
      { q: "How do I delete my account?", a: "Go to Settings → scroll to the Danger Zone section. Account deletion removes all your data including applications and profile information permanently." },
      { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. We never sell your data to third parties. Our masking is applied at the database query level, not just the UI." },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 mb-2">
          <HelpCircle size={28} className="text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Everything you need to know about applying for jobs anonymously and managing your career on Equalhires.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        {SECTIONS.map((s) => (
          <a
            key={s.title}
            href={`#${s.title.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
            className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all"
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">{s.title}</span>
            <ChevronRight size={14} className="ml-auto text-gray-400" />
          </a>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            id={section.title.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${section.color}`}>
                <section.icon size={18} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.q} className="card p-5 space-y-2">
                  <p className="font-medium text-gray-900">{item.q}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact footer */}
      <div className="mt-14 rounded-2xl bg-forest p-8 text-center space-y-3">
        <h3 className="text-lg font-semibold text-white">Still have questions?</h3>
        <p className="text-sm text-gray-300">
          Our support team typically responds within one business day.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Contact support <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
