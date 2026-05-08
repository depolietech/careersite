"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import en from "./locales/en.json";
import frCA from "./locales/fr-CA.json";
import esMX from "./locales/es-MX.json";

export type Locale = "en" | "fr-CA" | "es-MX";

const LOCALES: Record<Locale, typeof en> = { en, "fr-CA": frCA, "es-MX": esMX };
const COOKIE_KEY = "equalhires_locale";

type DeepValue<T> = T extends object ? { [K in keyof T]: DeepValue<T[K]> } : string;
type Translations = typeof en;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  locales: { code: Locale; label: string; short: string }[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("fr")) return "fr-CA";
  if (lang.startsWith("es")) return "es-MX";
  return "en";
}

function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`));
  const val = match?.[1];
  if (val === "en" || val === "fr-CA" || val === "es-MX") return val;
  return null;
}

function writeCookieLocale(locale: Locale) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_KEY}=${locale};expires=${expires};path=/;SameSite=Lax`;
  try { localStorage.setItem(COOKIE_KEY, locale); } catch {}
}

function getInitialLocale(): Locale {
  // Runs only on the client (useState lazy initializer is not called during SSR)
  try {
    return (
      readCookieLocale() ??
      (localStorage.getItem(COOKIE_KEY) as Locale | null) ??
      detectBrowserLocale()
    );
  } catch {
    return detectBrowserLocale();
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Sync html lang attribute on initial load (setLocale handles it for user-triggered changes)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeCookieLocale(l);
    // Update html lang attribute for accessibility
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback((key: string) => {
    return getNestedValue(LOCALES[locale] as unknown as Record<string, unknown>, key);
  }, [locale]);

  const locales: I18nContextValue["locales"] = [
    { code: "en",    label: "English",             short: "EN" },
    { code: "fr-CA", label: "Français (Canada)",   short: "FR" },
    { code: "es-MX", label: "Español (México)",    short: "ES" },
  ];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
