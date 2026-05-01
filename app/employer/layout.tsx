import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/shared/navbar";
import { EmailVerificationBanner } from "@/components/shared/EmailVerificationBanner";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const showBanner = session?.user && session.user.isEmailVerified === false;

  let unreadCount = 0;
  if (session?.user) {
    unreadCount = await db.notification.count({
      where: { userId: session.user.id, read: false },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar variant="app" userRole="EMPLOYER" unreadCount={unreadCount} />
      {showBanner && <EmailVerificationBanner email={session!.user.email} />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
