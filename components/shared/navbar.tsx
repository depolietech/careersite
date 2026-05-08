"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, Calendar, Mail, User, ChevronRight, LogOut, Settings, Building2, UserCircle, LayoutDashboard, HelpCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

interface NavbarProps {
  variant?: "marketing" | "app";
  userRole?: string | null;
  unreadCount?: number;
}

type NavLink = { href: string; label: string };

function NavLink({ href, label, active }: NavLink & { active?: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active
          ? "text-white border-b-2 border-brand-500 pb-0.5"
          : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function OutlineBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-500/10 transition-colors"
    >
      {children}
    </Link>
  );
}

function ProfileDropdown({
  menuItems,
  signOutLabel,
}: {
  menuItems: { href: string; label: string; icon: React.ElementType }[];
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 hover:text-white hover:border-gray-300 transition-colors"
        aria-label="Profile menu"
      >
        <User size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-700 bg-forest shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </Link>
            ))}
            <div className="my-1 border-t border-gray-700" />
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
            >
              <LogOut size={15} className="shrink-0" />
              {signOutLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ variant = "marketing", userRole, unreadCount = 0 }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();
  const isApp = variant === "app" && !!userRole;

  const appLinks: Record<string, NavLink[]> = {
    JOB_SEEKER: [
      { href: "/dashboard",  label: t("nav.dashboard") },
      { href: "/jobs",       label: t("nav.jobs") },
      { href: "/profile",    label: t("nav.profile") },
    ],
    EMPLOYER: [
      { href: "/employer/dashboard",  label: t("nav.dashboard") },
      { href: "/employer/post-job",   label: t("nav.postJob") },
      { href: "/employer/talent",     label: t("nav.talents") },
      { href: "/employer/applicants", label: t("nav.applicants") },
    ],
  };
  appLinks.CONTRACTOR = appLinks.EMPLOYER;

  const marketingLinks: NavLink[] = [
    { href: "/",        label: t("nav.home") },
    { href: "/about",   label: t("nav.about") },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: t("nav.contactUs") },
  ];

  const seekerMenu = [
    { href: "/profile",   label: t("nav.profile"),   icon: UserCircle },
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/settings",  label: t("nav.settings"),  icon: Settings },
    { href: "/help",      label: t("nav.help"),      icon: HelpCircle },
  ];

  const employerMenu = [
    { href: "/employer/company",      label: t("employer.viewCompanyProfile"),  icon: Building2 },
    { href: "/employer/company/edit", label: t("employer.editCompanyDetails"),  icon: Building2 },
    { href: "/employer/settings",     label: t("nav.settings"),       icon: Settings },
    { href: "/employer/help",         label: t("nav.help"),           icon: HelpCircle },
  ];

  const links = isApp ? (appLinks[userRole!] ?? []) : marketingLinks;
  const menuItems = userRole === "EMPLOYER" ? employerMenu : seekerMenu;

  function isActive(href: string) {
    if (href === "/" || href === "/employer/dashboard" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-forest">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink key={l.href} {...l} active={isActive(l.href)} />
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <div className="[&_button]:text-gray-300 [&_button]:hover:text-white [&_button]:hover:bg-white/10 [&_button:focus-visible]:ring-white">
            <LanguageSwitcher />
          </div>
          {isApp ? (
            <div className="flex items-center gap-4">
              {(() => {
                const p = userRole === "EMPLOYER" ? "/employer" : "";
                return (
                  <>
                    <Link href={`${p}/notifications`} aria-label={`${t("nav.notifications")}${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`} className="relative text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                      <Bell size={20} aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white" aria-hidden="true">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link href={`${p}/calendar`} aria-label={t("nav.calendar")} className="text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                      <Calendar size={20} aria-hidden="true" />
                    </Link>
                    <Link href={`${p}/messages`} aria-label={t("nav.messages")} className="text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                      <Mail size={20} aria-hidden="true" />
                    </Link>
                    <ProfileDropdown menuItems={menuItems} signOutLabel={t("nav.signOut")} />
                  </>
                );
              })()}
            </div>
          ) : (
            <>
              <OutlineBtn href="/login">{t("nav.signIn")} <ChevronRight size={14} /></OutlineBtn>
              <OutlineBtn href="/register">{t("nav.signUp")} <ChevronRight size={14} /></OutlineBtn>
            </>
          )}
        </div>

        <button
          className="md:hidden text-gray-300 hover:text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? t("a11y.closeMenu") : t("a11y.openMenu")}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-forest px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isApp ? (
            <div className="pt-3 border-t border-white/10 space-y-1">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/10"
              >
                <LogOut size={15} />
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            <div className="pt-3 flex flex-col gap-2">
              <OutlineBtn href="/login">{t("nav.signIn")} <ChevronRight size={14} /></OutlineBtn>
              <OutlineBtn href="/register">{t("nav.signUp")} <ChevronRight size={14} /></OutlineBtn>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
