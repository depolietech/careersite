import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Bell, Briefcase, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { getServerLocale, createServerT } from "@/lib/i18n/server";

const TYPE_ICON: Record<string, React.ElementType> = {
  APPLICATION_SUBMITTED: Briefcase,
  STATUS_CHANGED:        TrendingUp,
  NEW_APPLICATION:       Bell,
};

const TYPE_COLOR: Record<string, string> = {
  APPLICATION_SUBMITTED: "bg-brand-100 text-brand-600",
  STATUS_CHANGED:        "bg-green-100 text-green-600",
  NEW_APPLICATION:       "bg-gray-100 text-gray-500",
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7)   return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const t = createServerT(locale);

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark all as read now that the user has seen them
  if (unreadCount > 0) {
    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("notifications.title")}</h1>
          <p className="text-gray-500 mt-1">{t("notifications.subtitle")}</p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-10 text-center space-y-3">
          <Bell size={32} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium">{t("notifications.empty")}</p>
          <p className="text-sm text-gray-400">{t("notifications.emptyDescSeeker")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon  = TYPE_ICON[n.type]  ?? Bell;
            const color = TYPE_COLOR[n.type] ?? "bg-gray-100 text-gray-500";
            return (
              <div
                key={n.id}
                className={`card p-5 flex items-start gap-4 ${n.read ? "" : "border-l-4 border-brand-500"}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${n.read ? "text-gray-600" : "text-gray-900"}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CheckCircle2 size={13} />
        <span>{t("notifications.privacyNote")}</span>
      </div>
    </div>
  );
}
