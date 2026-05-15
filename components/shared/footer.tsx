"use client";
import Link from "next/link";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("footer.forSeekers")}</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/jobs",                     label: t("footer.browseJobs") },
                { href: "/register?role=job-seeker", label: t("footer.createProfile") },
                { href: "/login",                    label: t("footer.signIn") },
                { href: "/job-seeker-agreement",     label: t("footer.jobSeekerAgreement") },
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
            <h3 className="text-sm font-semibold text-gray-900">{t("footer.forEmployers")}</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/register?role=employer",   label: t("footer.postJob") },
                { href: "/register?role=contractor", label: t("footer.contractorAccess") },
                { href: "/employer/dashboard",       label: t("footer.dashboard") },
                { href: "/recruiter-agreement",      label: "Recruiter Agreement" },
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
            <h3 className="text-sm font-semibold text-gray-900">{t("footer.company")}</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/about",      label: t("footer.about") },
                { href: "/whats-new",  label: t("footer.whatsNew") },
                { href: "/faq",        label: t("footer.faq") },
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
            <h3 className="text-sm font-semibold text-gray-900">{t("footer.legal")}</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/terms",           label: t("footer.terms") },
                { href: "/privacy",         label: t("footer.privacyPolicy") },
                { href: "/cookie-policy",   label: t("footer.cookiePolicy") },
                { href: "/accessibility",   label: t("footer.accessibility") },
                { href: "/security-policy", label: t("footer.securityPolicy") },
                { href: "/data-retention",  label: t("footer.dataRetention") },
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
            © {new Date().getFullYear()} Equalhires. {t("footer.allRightsReserved")}
          </p>
          <p className="text-sm text-gray-400">
            {t("footer.fairerHiring")}
          </p>
        </div>
      </div>
    </footer>
  );
}
