import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, GraduationCap, FileText, Clock, CheckCircle2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecruiterReviewForm } from "@/components/shared/RecruiterReviewForm";

function formatYYYYMM(val: string | null | undefined): string {
  if (!val) return "";
  const [year, month] = val.split("-");
  if (!month) return year;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1] ?? month} ${year}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Applied", REVIEWING: "Under Review", SHORTLISTED: "Shortlisted",
  FORWARDED: "Forwarded", INTERVIEW_SCHEDULED: "Interview Stage",
  REJECTED: "Not Selected", OFFER_MADE: "Offer Made", HIRED: "Hired",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  PENDING: "default", REVIEWING: "info", SHORTLISTED: "success",
  FORWARDED: "info", INTERVIEW_SCHEDULED: "success", REJECTED: "danger",
  OFFER_MADE: "success", HIRED: "success",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await db.application.findUnique({
    where: { id },
    include: {
      job: {
        select: {
          title: true, location: true, jobType: true,
          employerProfile: { select: { id: true, companyName: true, industry: true } },
        },
      },
      resume: { select: { name: true, fileName: true } },
    },
  });

  if (!application || application.userId !== session.user.id) notFound();

  let snapshot: {
    skills: string[];
    headline: string | null;
    summary: string | null;
    yearsExperience: number | null;
    jobType: string | null;
    workExperiences: { title: string; company: string; startDate: string; endDate: string | null; current: boolean }[];
    educations: { degree: string; institution: string; startYear: number; endYear: number | null }[];
    certifications?: { name: string; issuer: string; dateObtained: string | null; expiryDate: string | null }[];
    resumeName: string | null;
    snapshotAt: string;
  } | null = null;

  if (application.profileSnapshot) {
    try { snapshot = JSON.parse(application.profileSnapshot); } catch { /* ignore */ }
  }

  const applied = new Date(application.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="card p-6 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{application.job.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {application.job.employerProfile?.companyName ?? "Company"} · {application.job.location}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[application.status] ?? "default"}>
            {STATUS_LABEL[application.status] ?? application.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={12} /> Applied {applied}
        </div>
        {application.coverLetter && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cover Letter</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
          </div>
        )}
      </div>

      {/* Snapshot notice */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800 flex items-center gap-2">
        <CheckCircle2 size={15} className="shrink-0" />
        This is an immutable snapshot of your profile <strong>exactly as submitted</strong>. Your identity remains masked until an interview is scheduled.
      </div>

      {/* Recruiter review — show after interview/hired/rejected */}
      {["INTERVIEW_SCHEDULED", "OFFER_MADE", "HIRED", "REJECTED"].includes(application.status) &&
        application.job.employerProfile?.id && (
          <RecruiterReviewForm
            employerProfileId={application.job.employerProfile.id}
            companyName={application.job.employerProfile.companyName}
          />
        )
      }

      {!snapshot ? (
        <div className="card p-6 text-center text-gray-400 text-sm">
          No profile snapshot available for this application.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Resume */}
          {snapshot.resumeName && (
            <div className="card p-5 space-y-2">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={16} className="text-brand-500" /> Resume Submitted
              </h2>
              <p className="text-sm text-gray-600">{snapshot.resumeName}</p>
            </div>
          )}

          {/* Skills */}
          {snapshot.skills.length > 0 && (
            <div className="card p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {snapshot.skills.map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-700 text-sm px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {(snapshot.headline || snapshot.summary) && (
            <div className="card p-5 space-y-2">
              <h2 className="font-semibold text-gray-900">Professional Summary</h2>
              {snapshot.headline && <p className="text-sm font-medium text-gray-700">{snapshot.headline}</p>}
              {snapshot.summary && <p className="text-sm text-gray-600 whitespace-pre-line">{snapshot.summary}</p>}
            </div>
          )}

          {/* Work Experience */}
          {snapshot.workExperiences.length > 0 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={16} className="text-brand-500" /> Work Experience
              </h2>
              {snapshot.workExperiences.map((w, i) => (
                <div key={i} className="border-l-2 border-brand-200 pl-4 space-y-0.5">
                  <p className="font-medium text-gray-900 text-sm">{w.title}</p>
                  <p className="text-sm text-gray-500">{w.company}</p>
                  <p className="text-xs text-gray-400">
                    {formatYYYYMM(w.startDate)} – {w.current ? "Present" : (w.endDate ? formatYYYYMM(w.endDate) : "—")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {snapshot.educations.length > 0 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap size={16} className="text-brand-500" /> Education
              </h2>
              {snapshot.educations.map((e, i) => (
                <div key={i} className="border-l-2 border-teal-200 pl-4 space-y-0.5">
                  <p className="font-medium text-gray-900 text-sm">{e.degree}</p>
                  <p className="text-sm text-gray-500">{e.institution}</p>
                  <p className="text-xs text-gray-400">{e.startYear} – {e.endYear ?? "Present"}</p>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {snapshot.certifications && snapshot.certifications.length > 0 && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Award size={16} className="text-brand-500" /> Certifications
              </h2>
              {snapshot.certifications.map((c, i) => (
                <div key={i} className="border-l-2 border-purple-200 pl-4 space-y-0.5">
                  <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.issuer}</p>
                  {c.dateObtained && (
                    <p className="text-xs text-gray-400">
                      Issued {formatYYYYMM(c.dateObtained)}{c.expiryDate ? ` · Expires ${formatYYYYMM(c.expiryDate)}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-center text-gray-400">
            Snapshot captured: {new Date(snapshot.snapshotAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
