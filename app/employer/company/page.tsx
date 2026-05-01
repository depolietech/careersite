import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Globe, MapPin, Users, Briefcase, Edit2, ArrowLeft } from "lucide-react";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.employerProfile.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { postedJobs: true } } },
  });

  if (!profile) redirect("/employer/dashboard");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <Link
            href="/employer/company/edit"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={14} /> Edit profile
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
              {profile.companySize} employees
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
            {profile._count.postedJobs} job{profile._count.postedJobs !== 1 ? "s" : ""} posted
          </div>
        </div>

        {profile.description ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About</p>
            <p className="text-gray-600 leading-relaxed">{profile.description}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            No company description yet.{" "}
            <Link href="/employer/company/edit" className="text-brand-600 hover:underline">Add one</Link>
          </div>
        )}
      </div>

      {/* Trust score */}
      <div className="card p-6 space-y-3">
        <h3 className="font-semibold text-gray-900">Account standing</h3>
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
          Interviews scheduled: {profile.interviewsScheduled} · Cancelled: {profile.interviewsCancelled}
        </p>
      </div>
    </div>
  );
}
