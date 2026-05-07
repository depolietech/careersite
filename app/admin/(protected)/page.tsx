import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, Briefcase, Calendar, AlertTriangle, ShieldCheck, Flag } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const [
    totalUsers,
    jobSeekers,
    employers,
    totalJobs,
    totalInterviews,
    blockedEmployers,
    pendingVerifications,
    openReports,
    recentLogs,
  ] = await Promise.all([
    db.user.count({ where: { role: { not: "ADMIN" } } }),
    db.user.count({ where: { role: "JOB_SEEKER" } }),
    db.user.count({ where: { role: "EMPLOYER" } }),
    db.job.count(),
    db.interview.count(),
    db.employerProfile.count({ where: { isBlocked: true } }),
    db.employerProfile.count({ where: { verificationStatus: "PENDING_REVIEW" } }),
    db.recruiterReport.count({ where: { status: "PENDING" } }),
    db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Job Seekers",           value: jobSeekers,          icon: Users,         color: "bg-green-50 text-green-600",   border: "border-green-100",   href: "/admin/job-seekers" },
    { label: "Recruiters",            value: employers,           icon: Briefcase,     color: "bg-purple-50 text-purple-600", border: "border-purple-100",  href: "/admin/recruiters" },
    { label: "Active Jobs",           value: totalJobs,           icon: Briefcase,     color: "bg-brand-50 text-brand-600",   border: "border-brand-100",   href: "/admin/jobs?status=ACTIVE" },
    { label: "Interviews Scheduled",  value: totalInterviews,     icon: Calendar,      color: "bg-amber-50 text-amber-600",   border: "border-amber-100",   href: "/admin/recruiters" },
    { label: "Pending Verifications", value: pendingVerifications,icon: ShieldCheck,   color: "bg-blue-50 text-blue-600",     border: "border-blue-100",    href: "/admin/verifications?status=PENDING_REVIEW" },
    { label: "Open Reports",          value: openReports,         icon: Flag,          color: "bg-orange-50 text-orange-600", border: "border-orange-100",  href: "/admin/reports?status=PENDING" },
    { label: "Blocked Recruiters",    value: blockedEmployers,    icon: AlertTriangle, color: "bg-red-50 text-red-600",       border: "border-red-100",     href: "/admin/recruiters?blocked=true" },
    { label: "Total Users",           value: totalUsers,          icon: Users,         color: "bg-gray-50 text-gray-600",     border: "border-gray-200",    href: "/admin/users" },
  ];

  return (
    <div className="px-8 py-10 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and moderation.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, border, href }) => (
          <Link key={label} href={href} className={`rounded-2xl border ${border} p-5 bg-white hover:shadow-md transition-shadow block`}>
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${color} mb-4`}>
              <Icon size={18} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Audit Logs</h2>
            <Link href="/admin/logs" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">No logs yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentLogs.map((log) => (
                <div key={log.id} className="px-6 py-3">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  {log.note && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/verifications?status=PENDING_REVIEW" className="flex items-center gap-3 rounded-xl border border-blue-100 p-3 hover:bg-blue-50 transition-colors text-sm font-medium text-blue-700">
              <ShieldCheck size={16} /> Review Verifications {pendingVerifications > 0 && `(${pendingVerifications} pending)`}
            </Link>
            <Link href="/admin/reports?status=PENDING" className="flex items-center gap-3 rounded-xl border border-orange-100 p-3 hover:bg-orange-50 transition-colors text-sm font-medium text-orange-700">
              <Flag size={16} /> Open Reports {openReports > 0 && `(${openReports})`}
            </Link>
            <Link href="/admin/recruiters?blocked=true" className="flex items-center gap-3 rounded-xl border border-red-100 p-3 hover:bg-red-50 transition-colors text-sm font-medium text-red-700">
              <AlertTriangle size={16} /> Blocked Recruiters ({blockedEmployers})
            </Link>
            <Link href="/admin/jobs" className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Briefcase size={16} className="text-gray-400" /> Manage Jobs
            </Link>
            <Link href="/admin/logs" className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Users size={16} className="text-gray-400" /> View Audit Logs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
