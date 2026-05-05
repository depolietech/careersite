import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, Shield, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin",          label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/users",    label: "Users",        icon: Users },
  { href: "/admin/logs",     label: "Audit Logs",   icon: FileText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-forest text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-brand-400" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{session.user.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
