import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import { Chatbot } from "@/components/shared/Chatbot";
import { CookieBanner } from "@/components/cookie-banner";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Equalhires — Skills-First Hiring",
    template: "%s | Equalhires",
  },
  description:
    "A fair recruitment platform where candidates are evaluated on skills and experience — personal details revealed only when an interview is scheduled.",
  keywords: ["jobs", "recruitment", "equalhires", "fair hiring", "diversity"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {/* Skip navigation — keyboard/screen reader accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <I18nProvider>
          <Providers>
            {children}
            <Chatbot />
            <CookieBanner />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
