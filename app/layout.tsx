import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import { Chatbot } from "@/components/shared/Chatbot";
import { CookieBanner } from "@/components/cookie-banner";
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
    default: "Bias-Free Careers — Skills-First Hiring",
    template: "%s | Bias-Free Careers",
  },
  description:
    "A fair recruitment platform where candidates are evaluated on skills and experience — personal details revealed only when an interview is scheduled.",
  keywords: ["jobs", "recruitment", "bias-free hiring", "fair hiring", "diversity"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          {children}
          <Chatbot />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
