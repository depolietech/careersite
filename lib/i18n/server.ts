import { cookies } from "next/headers";
import en from "./locales/en.json";
import frCA from "./locales/fr-CA.json";
import esMX from "./locales/es-MX.json";
import type { Locale } from "./index";

const LOCALES: Record<Locale, typeof en> = { en, "fr-CA": frCA, "es-MX": esMX };
const COOKIE_KEY = "equalhires_locale";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const val = cookieStore.get(COOKIE_KEY)?.value;
  if (val === "en" || val === "fr-CA" || val === "es-MX") return val;
  return "en";
}

export function createServerT(locale: Locale) {
  return (key: string): string =>
    getNestedValue(LOCALES[locale] as unknown as Record<string, unknown>, key);
}
