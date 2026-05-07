import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Globe, MapPin, Users, Briefcase, Edit2, ArrowLeft } from "lucide-react";
import { getServerLocale, createServerT } from "@/lib/i18n/server";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const t = createServerT(locale);

  const profile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { postedJobs: true } } },
  });

  if (!profile) redirect("/employer/dashboard");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> {t("employer.backToDashboard")}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{t("employer.companyProfile")}</h1>
          <Link
            href="/employer/company/edit"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={14} /> {t("employer.editProfile")}
          </Link>
        </div>
      </div>

      <div className="card p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0">
            <Building2 size={28} className="text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.companyName || "Unnamed Company"}</h2>
            {profile.industry && <p className="text-gray-500 mt-0.5">{profile.industry}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {profile.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={15} className="text-gray-400" />
              {profile.location}
            </div>
          )}
          {profile.companySize && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={15} className="text-gray-400" />
              {profile.companySize} {t("employer.employees")}
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-2 text-gray-600">
              <Globe size={15} className="text-gray-400" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase size={15} className="text-gray-400" />
            {profile._count.postedJobs} {t("employer.jobsPosted")}
          </div>
        </div>

        {profile.description ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{t("employer.about")}</p>
            <p className="text-gray-600 leading-relaxed">{profile.description}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            {t("employer.noDescription")}{" "}
            <Link href="/employer/company/edit" className="text-brand-600 hover:underline">{t("employer.addDescription")}</Link>
          </div>
        )}
      </div>

      {/* Trust score */}
      <div className="card p-6 space-y-3">
        <h3 className="font-semibold text-gray-900">{t("employer.accountStanding")}</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                style={{ width: `${profile.trustScore}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-green-600">{profile.trustScore.toFixed(0)}/100</span>
        </div>
        <p className="text-xs text-gray-400">
          {t("employer.interviewsScheduled")}: {profile.interviewsScheduled} · {t("employer.interviewsCancelled")}: {profile.interviewsCancelled}
        </p>
      </div>
    </div>
  );
}
