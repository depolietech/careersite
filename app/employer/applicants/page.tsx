import Link from "next/link";
import { Users, Briefcase, ArrowRight, EyeOff } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function AllApplicantsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const jobs = await db.job.findMany({
    where: { postedById: session.user.id },
    include: {
      _count: { select: { applications: true } },
      applications: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalApps = jobs.reduce((s, j) => s + j._count.applications, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/employer/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Back to dashboard
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Applicants</h1>
            <p className="text-gray-500 mt-1">
              {totalApps} total application{totalApps !== 1 ? "s" : ""} across {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/employer/post-job"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            + Post a job
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800 flex items-center gap-3">
        <EyeOff size={16} className="text-brand-600 shrink-0" />
        Candidate identities are masked until you schedule an interview.
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">No jobs posted yet</p>
          <p className="text-sm text-gray-500">Post your first job to start receiving applications.</p>
          <Link href="/employer/post-job" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
            Post a job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const pending     = job.applications.filter((a) => a.status === "PENDING").length;
            const reviewing   = job.applications.filter((a) => a.status === "REVIEWING").length;
            const shortlisted = job.applications.filter((a) => a.status === "SHORTLISTED").length;
            const interviewed = job.applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
            const rejected    = job.applications.filter((a) => a.status === "REJECTED").length;

            return (
              <Link
                key={job.id}
                href={`/employer/applicants/${job.id}`}
                className="card p-5 flex items-center gap-5 hover:shadow-card-hover transition-all group"
              >
                <div className="h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-brand-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                      job.status === "ACTIVE" ? "bg-brand-100 text-brand-700" :
                      job.status === "DRAFT"  ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{job.jobType} · {job.location}</p>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{job._count.applications}</p>
                    <p className="text-[11px] text-gray-400">Total</p>
                  </div>
                  {pending > 0 && (
                    <div>
                      <p className="text-lg font-bold text-gray-500">{pending}</p>
                      <p className="text-[11px] text-gray-400">Pending</p>
                    </div>
                  )}
                  {reviewing > 0 && (
                    <div>
                      <p className="text-lg font-bold text-blue-600">{reviewing}</p>
                      <p className="text-[11px] text-gray-400">Reviewing</p>
                    </div>
                  )}
                  {shortlisted > 0 && (
                    <div>
                      <p className="text-lg font-bold text-amber-600">{shortlisted}</p>
                      <p className="text-[11px] text-gray-400">Shortlisted</p>
                    </div>
                  )}
                  {interviewed > 0 && (
                    <div>
                      <p className="text-lg font-bold text-green-600">{interviewed}</p>
                      <p className="text-[11px] text-gray-400">Interviewed</p>
                    </div>
                  )}
                  {rejected > 0 && (
                    <div>
                      <p className="text-lg font-bold text-red-400">{rejected}</p>
                      <p className="text-[11px] text-gray-400">Rejected</p>
                    </div>
                  )}
                </div>

                <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
