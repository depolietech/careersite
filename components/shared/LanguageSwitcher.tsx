"use client";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Globe size={15} aria-hidden="true" />
        <span>{current.short}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50"
        >
          {locales.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={locale === l.code}
              type="button"
              onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                locale === l.code
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="w-6 text-center font-mono text-xs text-gray-400">{l.short}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
