"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors"
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
