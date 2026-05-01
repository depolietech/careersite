import Link from "next/link";
import { ChevronRight, Shield, Eye, Briefcase, MessageSquare, Settings, HelpCircle, Users, BarChart } from "lucide-react";

const SECTIONS = [
  {
    icon: Briefcase,
    title: "Posting jobs",
    color: "bg-brand-50 text-brand-600",
    items: [
      { q: "How do I post a new job?", a: "From your dashboard, click 'Post a job' in the top right, or use the navigation bar. Fill in the job title, description, location, salary range, required skills and experience level, then click Publish." },
      { q: "How long does a job listing stay active?", a: "Listings are active indefinitely until you close or pause them. You can manage the status of each listing from your dashboard job table." },
      { q: "Can I save a job as a draft?", a: "Yes — when creating a job, click 'Save draft' instead of Publish. Draft jobs are visible only to you and don't appear to candidates." },
      { q: "What locations can I post jobs for?", a: "You can post jobs for any North American location (United States, Canada, Mexico) or mark them as Remote. Remote-friendly roles reach candidates across all three countries." },
    ],
  },
  {
    icon: Shield,
    title: "How anonymisation works",
    color: "bg-amber-50 text-amber-600",
    items: [
      { q: "What information do I see about candidates?", a: "You see: job titles, skills, summary/description, years of experience, role category, and an anonymous degree/field (but not the institution). You do NOT see: name, photo, school name, company names, or exact employment dates." },
      { q: "Why is this better for hiring?", a: "Studies show that removing names and photos from applications reduces gender, racial, and socioeconomic bias by up to 50%. You focus only on skills and potential — leading to stronger, more diverse shortlists." },
      { q: "When does the candidate's identity get revealed?", a: "Automatically when you schedule an interview. At that point you'll see the candidate's full name, photo, and contact details. This protects the integrity of the shortlisting step." },
      { q: "Can I request an early reveal?", a: "No — this is intentional. The platform is designed so that interview invitations are made purely on merit. Early reveals would undermine the system's fairness guarantees." },
    ],
  },
  {
    icon: Users,
    title: "Managing applicants",
    color: "bg-green-50 text-green-600",
    items: [
      { q: "How do I review applications?", a: "Click a job listing on your dashboard, then click 'View applicants'. You'll see all anonymous profiles in a list. Click any profile to expand skills, experience, and their cover letter." },
      { q: "How do I move a candidate to the next stage?", a: "On the applicant page, use the status dropdown next to each candidate: Reviewing → Shortlisted → Interview Scheduled. Status changes are visible to the candidate in real-time." },
      { q: "Can I star or bookmark candidates?", a: "Yes — click the star icon on any candidate card to add them to your Starred Talents list. Starred candidates appear on your main dashboard for easy reference." },
      { q: "What happens when I reject a candidate?", a: "The candidate's dashboard shows 'Not selected'. We recommend writing a brief note when rejecting — it helps candidates improve. They cannot reapply to the same listing." },
    ],
  },
  {
    icon: Eye,
    title: "Scheduling interviews",
    color: "bg-purple-50 text-purple-600",
    items: [
      { q: "How do I schedule an interview?", a: "Set a candidate's status to 'Interview Scheduled', then a scheduling form appears. Enter the date, time, duration, type (video/phone/in-person), and optionally a meeting link." },
      { q: "Does the candidate see the meeting link?", a: "Yes — the link appears directly on the candidate's dashboard with a 'Join Interview' button. They also receive an email notification (if email sending is enabled)." },
      { q: "What is the trust score?", a: "Your trust score (out of 100) reflects your interview cancellation rate. High cancellation rates damage trust — candidates invest time preparing for interviews. Accounts with very low trust scores may have posting privileges limited." },
      { q: "Can I cancel a scheduled interview?", a: "Yes, but each cancellation reduces your trust score. To cancel, go to the applicant's profile and update their status. Always use the messaging system to inform the candidate immediately." },
    ],
  },
  {
    icon: MessageSquare,
    title: "Messaging candidates",
    color: "bg-blue-50 text-blue-600",
    items: [
      { q: "When can I message a candidate?", a: "Once an application moves to 'Shortlisted' status, a conversation thread opens. Messages go through our anonymous channel — the candidate's personal contact details are still hidden at this stage." },
      { q: "Can I share contact details via messages?", a: "We recommend not exchanging personal contact info until after the interview reveal. The messaging system is designed to support the anonymous process." },
      { q: "Are messages monitored?", a: "Messages are reviewed for policy violations (such as attempts to extract personal information before the reveal stage). Violations can result in account suspension." },
    ],
  },
  {
    icon: BarChart,
    title: "Analytics & reporting",
    color: "bg-teal-50 text-teal-600",
    items: [
      { q: "Can I see how many people applied to each job?", a: "Yes — your dashboard shows application count, number of people interviewed, and best matches for every job listing." },
      { q: "How is 'best matches' calculated?", a: "Best matches compares required skills in your job listing against skills listed in each anonymous profile. Candidates with 80%+ skill overlap are flagged as best matches." },
      { q: "Can I export applicant data?", a: "Post-interview, once identities are revealed, you can export candidate details from the applicant page. Pre-interview exports contain only anonymous profile data." },
    ],
  },
  {
    icon: Settings,
    title: "Account & company settings",
    color: "bg-gray-100 text-gray-600",
    items: [
      { q: "How do I update my company profile?", a: "Go to Settings → Company Profile. You can update your company name, size, industry, website, description, and location." },
      { q: "Can multiple team members use the same account?", a: "Currently each account is for a single recruiter. Team accounts are on our roadmap. For now, you can post jobs on behalf of multiple hiring managers." },
      { q: "How do I change my password?", a: "Settings → Security → Change password. You'll need your current password to set a new one." },
    ],
  },
];

export default function EmployerHelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 mb-2">
          <HelpCircle size={28} className="text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Recruiter Help Center</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Everything you need to hire effectively using anonymous, skills-first candidate review.
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
        <h3 className="text-lg font-semibold text-white">Need more help?</h3>
        <p className="text-sm text-gray-300">
          Our team is available Monday–Friday. We typically respond within one business day.
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
