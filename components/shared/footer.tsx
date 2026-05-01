import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Skills-first hiring. Personal details revealed only when an interview is scheduled.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Job Seekers</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/jobs", label: "Browse Jobs" },
                { href: "/register?role=job-seeker", label: "Create Profile" },
                { href: "/login", label: "Sign In" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Employers</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/register?role=employer", label: "Post a Job" },
                { href: "/register?role=contractor", label: "Contractor Access" },
                { href: "/employer/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/#how-it-works", label: "How it works" },
                { href: "/#features", label: "Features" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} EqualHire. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Built to make hiring fairer for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
}
