import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldAlert, Clock, XCircle, FileText, CheckCircle, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<string, {
  icon: React.ElementType;
  iconClass: string;
  badgeClass: string;
  heading: string;
  description: string;
}> = {
  APPROVED: {
    icon: ShieldCheck,
    iconClass: "text-green-600",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    heading: "Verified",
    description: "Your company is verified. You can post jobs and hire candidates.",
  },
  PENDING_REVIEW: {
    icon: Clock,
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    heading: "Under Review",
    description: "Our team is reviewing your verification submission. This typically takes 1–2 business days.",
  },
  MORE_INFO_REQUIRED: {
    icon: FileText,
    iconClass: "text-amber-600",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    heading: "Additional Documents Required",
    description: "We need more information before we can verify your account. Please review the requested documents below and send them to support.",
  },
  REJECTED: {
    icon: XCircle,
    iconClass: "text-red-500",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    heading: "Verification Declined",
    description: "Your verification was declined. Please review the reasons below, update your company details, and re-submit.",
  },
  INCOMPLETE: {
    icon: ShieldAlert,
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    heading: "Incomplete",
    description: "You have not yet submitted your company for verification. Complete your company profile to get verified and start posting jobs.",
  },
};

export default async function EmployerVerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      verificationStatus: true,
      verificationNote: true,
      verificationDeclineReasons: true,
      requestedDocuments: true,
      verificationSubmittedAt: true,
      companyName: true,
    },
  });

  if (!profile) redirect("/employer/dashboard");

  const status = profile.verificationStatus ?? "INCOMPLETE";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INCOMPLETE;
  const StatusIcon = cfg.icon;

  let declineReasons: string[] = [];
  let requestedDocuments: string[] = [];
  try { declineReasons = profile.verificationDeclineReasons ? JSON.parse(profile.verificationDeclineReasons) : []; } catch { /* ignore */ }
  try { requestedDocuments = profile.requestedDocuments ? JSON.parse(profile.requestedDocuments) : []; } catch { /* ignore */ }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
        <p className="text-gray-500 mt-1">Track your account verification status for {profile.companyName}.</p>
      </div>

      {/* Status card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
            <StatusIcon size={24} className={cfg.iconClass} />
          </div>
          <div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${cfg.badgeClass}`}>
              {cfg.heading}
            </span>
          </div>
        </div>
        <p className="text-gray-600">{cfg.description}</p>

        {profile.verificationSubmittedAt && (
          <p className="text-xs text-gray-400">
            Submitted on {new Date(profile.verificationSubmittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Decline reasons */}
      {declineReasons.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="font-semibold text-red-800">Decline Reasons</h2>
          </div>
          <ul className="space-y-2">
            {declineReasons.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-red-700">
                <XCircle size={14} className="mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
          {profile.verificationNote && (
            <p className="text-sm text-red-700 pt-2 border-t border-red-200">
              <strong>Admin note:</strong> {profile.verificationNote}
            </p>
          )}
        </div>
      )}

      {/* Requested documents */}
      {requestedDocuments.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-amber-600" />
            <h2 className="font-semibold text-amber-800">Documents Required</h2>
          </div>
          <p className="text-sm text-amber-700">
            Please prepare and email the following documents to{" "}
            <strong>verify@equalhires.com</strong> with your company name in the subject line.
          </p>
          <ul className="space-y-2">
            {requestedDocuments.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-amber-800">
                <CheckCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                {d}
              </li>
            ))}
          </ul>
          {profile.verificationNote && (
            <p className="text-sm text-amber-700 pt-2 border-t border-amber-200">
              <strong>Admin note:</strong> {profile.verificationNote}
            </p>
          )}
        </div>
      )}

      {/* Only note, no structured reasons */}
      {profile.verificationNote && declineReasons.length === 0 && requestedDocuments.length === 0 && (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
          <p className="text-sm text-gray-700">
            <strong>Admin note:</strong> {profile.verificationNote}
          </p>
        </div>
      )}

      {/* Action */}
      <div className="flex gap-3">
        {(status === "REJECTED" || status === "INCOMPLETE") && (
          <Link
            href="/employer/company/edit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Update company details
          </Link>
        )}
        {status === "MORE_INFO_REQUIRED" && (
          <a
            href="mailto:verify@equalhires.com"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Email documents to verify@equalhires.com
          </a>
        )}
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
