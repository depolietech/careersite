import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FaqAccordion } from "@/components/home/FaqAccordion";

export const metadata = { title: "FAQ — Equalhires" };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-sm text-gray-500 mb-10">
        Everything you need to know about how Equalhires works.
      </p>

      <FaqAccordion />
    </div>
  );
}
