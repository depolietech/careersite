import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/shared/navbar";
import { EmailVerificationBanner } from "@/components/shared/EmailVerificationBanner";

export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;
  const userRole = (user as { role?: string } | null)?.role ?? null;
  const showBanner = user && user.isEmailVerified === false;

  let unreadCount = 0;
  if (user?.id) {
    unreadCount = await db.notification.count({
      where: { userId: user.id, read: false },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user ? (
        <Navbar variant="app" userRole={userRole ?? "JOB_SEEKER"} unreadCount={unreadCount} />
      ) : (
        <Navbar variant="marketing" />
      )}
      {showBanner && <EmailVerificationBanner email={user!.email} />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
