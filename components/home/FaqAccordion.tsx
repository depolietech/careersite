"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function FaqAccordion() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  const FAQS = [
    { q: t("home.faq1Q"), a: t("home.faq1A") },
    { q: t("home.faq2Q"), a: t("home.faq2A") },
    { q: t("home.faq3Q"), a: t("home.faq3A") },
    { q: t("home.faq4Q"), a: t("home.faq4A") },
    { q: t("home.faq5Q"), a: t("home.faq5A") },
    { q: t("home.faq6Q"), a: t("home.faq6A") },
    { q: t("home.faq7Q"), a: t("home.faq7A") },
    { q: t("home.faq8Q"), a: t("home.faq8A") },
    { q: t("home.faq9Q"), a: t("home.faq9A") },
  ];

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {FAQS.map((faq, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <span>{faq.q}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
